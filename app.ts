import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveFile } from "https://deno.land/std@0.224.0/http/file_server.ts";
import { extname, join } from "https://deno.land/std@0.224.0/path/mod.ts";

interface ImageInfo {
  filename: string;
  description: string;
}

class PhotoDescriptionApp {
  private photosDir: string;
  private imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  constructor(photosDir: string) {
    this.photosDir = photosDir;
  }

  async validateDirectory(): Promise<void> {
    try {
      const stat = await Deno.stat(this.photosDir);
      if (!stat.isDirectory) {
        throw new Error(`${this.photosDir} no es un directorio`);
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new Error(`El directorio ${this.photosDir} no existe`);
      }
      throw error;
    }
  }

  async getImageFiles(): Promise<string[]> {
    const files: string[] = [];
    
    for await (const entry of Deno.readDir(this.photosDir)) {
      if (entry.isFile) {
        const ext = extname(entry.name).toLowerCase();
        if (this.imageExtensions.includes(ext)) {
          files.push(entry.name);
        }
      }
    }

    // Ordenar por fecha de modificación (más reciente primero)
    const filesWithStats = await Promise.all(
      files.map(async (filename) => {
        const stat = await Deno.stat(join(this.photosDir, filename));
        return { filename, mtime: stat.mtime || new Date(0) };
      })
    );

    return filesWithStats
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
      .map(item => item.filename);
  }

  async getImageDescription(filename: string): Promise<string> {
    const mdPath = join(this.photosDir, `${filename}.md`);
    try {
      const content = await Deno.readTextFile(mdPath);
      return content.trim();
    } catch {
      return '';
    }
  }

  async saveImageDescription(filename: string, description: string): Promise<void> {
    const mdPath = join(this.photosDir, `${filename}.md`);
    await Deno.writeTextFile(mdPath, description);
  }

  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Servir archivos estáticos
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return await serveFile(request, './public/index.html');
    }
    
    if (url.pathname.startsWith('/public/')) {
      return await serveFile(request, `.${url.pathname}`);
    }

    // API endpoints
    if (url.pathname === '/api/images' && request.method === 'GET') {
      return await this.handleGetImages();
    }

    if (url.pathname === '/api/save' && request.method === 'POST') {
      return await this.handleSaveDescription(request);
    }

    // Servir imágenes desde el directorio de fotos
    if (url.pathname.startsWith('/images/')) {
      const filename = url.pathname.replace('/images/', '');
      const imagePath = join(this.photosDir, filename);
      try {
        return await serveFile(request, imagePath);
      } catch {
        return new Response('Imagen no encontrada', { status: 404 });
      }
    }

    return new Response('No encontrado', { status: 404 });
  }

  async handleGetImages(): Promise<Response> {
    try {
      const imageFiles = await this.getImageFiles();
      const images: ImageInfo[] = await Promise.all(
        imageFiles.map(async (filename) => ({
          filename,
          description: await this.getImageDescription(filename)
        }))
      );

      return new Response(JSON.stringify(images), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async handleSaveDescription(request: Request): Promise<Response> {
    try {
      const { filename, description } = await request.json();
      
      if (!filename || typeof description !== 'string') {
        return new Response(JSON.stringify({ error: 'Datos inválidos' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      await this.saveImageDescription(filename, description);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  async start(port = 8000): Promise<void> {
    console.log(`🚀 Servidor iniciado en http://localhost:${port}`);
    console.log(`📁 Directorio de fotos: ${this.photosDir}`);
    
    await serve((request) => this.handleRequest(request), { port });
  }
}

// Punto de entrada principal
async function main() {
  const args = Deno.args;
  
  if (args.length === 0) {
    console.error('❌ Error: Debes especificar la ruta del directorio de fotos');
    console.log('Uso: deno run --allow-read --allow-write --allow-net app.ts ./mis_fotos');
    Deno.exit(1);
  }

  const photosDir = args[0];
  const app = new PhotoDescriptionApp(photosDir);

  try {
    await app.validateDirectory();
    await app.start();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}