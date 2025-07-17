# 📸 Gestor de Descripciones de Fotos

Una aplicación web desarrollada con Deno que permite añadir y gestionar descripciones para fotografías, guardándolas como archivos Markdown.

## 🚀 Características

- **Navegación intuitiva**: Carrusel de imágenes con botones y navegación por teclado
- **Editor de descripciones**: Área de texto para escribir descripciones detalladas
- **Guardado automático**: Las descripciones se guardan como archivos `.md`
- **Ordenamiento inteligente**: Las imágenes se muestran por fecha de modificación
- **Interfaz responsive**: Funciona perfectamente en dispositivos móviles y escritorio
- **Formatos soportados**: JPG, JPEG, PNG, WEBP

## 📋 Requisitos

- [Deno](https://deno.land/) instalado en tu sistema

## 🛠️ Instalación y Uso

### 1. Preparar el directorio de fotos

Crea un directorio con tus fotos o usa uno existente:

```bash
mkdir mis_fotos
# Copia tus imágenes al directorio
```

### 2. Ejecutar la aplicación

```bash
deno run --allow-read --allow-write --allow-net app.ts ./mis_fotos
```

**Permisos necesarios:**
- `--allow-read`: Para leer las imágenes y archivos de descripción
- `--allow-write`: Para guardar las descripciones como archivos `.md`
- `--allow-net`: Para el servidor web local

### 3. Acceder a la aplicación

Abre tu navegador y ve a: `http://localhost:8000`

## 🎮 Controles

### Navegación
- **Botones**: Usa los botones "‹" y "›" para navegar
- **Teclado**: 
  - `←` (flecha izquierda): Imagen anterior
  - `→` (flecha derecha): Imagen siguiente
  - `Ctrl/Cmd + Enter`: Guardar descripción

### Funcionalidades
- **Editar descripción**: Escribe en el área de texto debajo de la imagen
- **Guardar**: Haz clic en "💾 Guardar Descripción" o usa `Ctrl/Cmd + Enter`
- **Confirmación visual**: Verás un mensaje "✅ ¡Descripción guardada correctamente!"

## 📁 Estructura de archivos

```
proyecto/
├── app.ts              # Servidor backend de Deno
├── public/
│   ├── index.html      # Interfaz principal
│   ├── script.js       # Lógica del frontend
│   └── styles.css      # Estilos CSS
└── mis_fotos/          # Tu directorio de fotos
    ├── foto1.jpg
    ├── foto1.jpg.md    # Descripción de foto1.jpg
    ├── foto2.png
    └── foto2.png.md    # Descripción de foto2.png
```

## 🔧 Personalización

### Cambiar el puerto

```bash
# Modifica la línea en app.ts:
await app.start(3000); // Cambia 8000 por el puerto deseado
```

### Añadir más formatos de imagen

```typescript
// En app.ts, modifica la línea:
private imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
```

## 🐛 Solución de problemas

### Error: "El directorio no existe"
- Verifica que la ruta del directorio sea correcta
- Usa rutas absolutas si tienes problemas con rutas relativas

### Error: "Permission denied"
- Asegúrate de incluir todos los permisos necesarios
- En algunos sistemas, podrías necesitar `--allow-all` para pruebas

### Las imágenes no se cargan
- Verifica que las imágenes tengan extensiones soportadas
- Comprueba que los archivos no estén corruptos

## 📝 Ejemplos de uso

```bash
# Uso básico
deno run --allow-read --allow-write --allow-net app.ts ./fotos

# Con ruta absoluta
deno run --allow-read --allow-write --allow-net app.ts /home/usuario/Imágenes

# En Windows
deno run --allow-read --allow-write --allow-net app.ts "C:\Users\Usuario\Pictures"
```

## 🎯 Características técnicas

- **Backend**: Deno con TypeScript
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Almacenamiento**: Archivos Markdown locales
- **Servidor**: HTTP server nativo de Deno
- **Responsive**: Compatible con móviles y tablets

¡Disfruta organizando y describiendo tus fotografías! 📷✨