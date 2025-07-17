class PhotoDescriptionManager {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.isLoading = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadImages();
    }

    initializeElements() {
        this.currentImage = document.getElementById('currentImage');
        this.descriptionText = document.getElementById('descriptionText');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.saveStatus = document.getElementById('saveStatus');
        this.currentIndexSpan = document.getElementById('currentIndex');
        this.totalImagesSpan = document.getElementById('totalImages');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.noImagesDiv = document.getElementById('noImages');
    }

    attachEventListeners() {
        this.prevBtn.addEventListener('click', () => this.previousImage());
        this.nextBtn.addEventListener('click', () => this.nextImage());
        this.saveBtn.addEventListener('click', () => this.saveDescription());
        
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousImage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextImage();
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.saveDescription();
            }
        });

        // Detectar cambios en el textarea
        this.descriptionText.addEventListener('input', () => {
            this.updateSaveButtonState();
        });

        // Manejar carga de imagen
        this.currentImage.addEventListener('load', () => {
            this.currentImage.classList.add('loaded');
        });

        this.currentImage.addEventListener('error', () => {
            console.error('Error al cargar la imagen');
        });
    }

    async loadImages() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/images');
            
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }
            
            this.images = await response.json();
            
            if (this.images.length === 0) {
                this.showNoImages();
                return;
            }
            
            this.updateUI();
            this.displayCurrentImage();
            
        } catch (error) {
            console.error('Error al cargar las imágenes:', error);
            this.showError('Error al cargar las imágenes. Verifica que el servidor esté funcionando.');
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        this.loadingSpinner.style.display = show ? 'block' : 'none';
        this.currentImage.style.display = show ? 'none' : 'block';
    }

    showNoImages() {
        this.loadingSpinner.style.display = 'none';
        this.noImagesDiv.style.display = 'block';
        this.disableControls();
    }

    showError(message) {
        this.saveStatus.textContent = message;
        this.saveStatus.className = 'save-status error';
        setTimeout(() => {
            this.saveStatus.textContent = '';
            this.saveStatus.className = 'save-status';
        }, 5000);
    }

    disableControls() {
        this.prevBtn.disabled = true;
        this.nextBtn.disabled = true;
        this.saveBtn.disabled = true;
        this.descriptionText.disabled = true;
    }

    updateUI() {
        this.totalImagesSpan.textContent = this.images.length;
        this.currentIndexSpan.textContent = this.images.length > 0 ? this.currentIndex + 1 : 0;
        
        // Actualizar estado de botones de navegación
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex === this.images.length - 1;
        
        this.updateSaveButtonState();
    }

    updateSaveButtonState() {
        if (this.images.length === 0) {
            this.saveBtn.disabled = true;
            return;
        }
        
        const currentImage = this.images[this.currentIndex];
        const currentDescription = this.descriptionText.value.trim();
        const hasChanged = currentDescription !== (currentImage?.description || '');
        
        this.saveBtn.disabled = !hasChanged || this.isLoading;
    }

    displayCurrentImage() {
        if (this.images.length === 0) return;
        
        const image = this.images[this.currentIndex];
        
        // Ocultar imagen mientras carga
        this.currentImage.classList.remove('loaded');
        this.currentImage.src = `/images/${image.filename}`;
        
        // Actualizar descripción
        this.descriptionText.value = image.description || '';
        
        // Limpiar estado de guardado
        this.clearSaveStatus();
        
        this.updateUI();
    }

    previousImage() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.displayCurrentImage();
        }
    }

    nextImage() {
        if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
            this.displayCurrentImage();
        }
    }

    async saveDescription() {
        if (this.isLoading || this.images.length === 0) return;
        
        const currentImage = this.images[this.currentIndex];
        const description = this.descriptionText.value.trim();
        
        try {
            this.isLoading = true;
            this.saveBtn.disabled = true;
            this.saveBtn.textContent = '💾 Guardando...';
            
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: currentImage.filename,
                    description: description
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Actualizar la descripción en memoria
                this.images[this.currentIndex].description = description;
                
                this.showSaveSuccess();
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
            
        } catch (error) {
            console.error('Error al guardar:', error);
            this.showSaveError('Error al guardar la descripción. Inténtalo de nuevo.');
        } finally {
            this.isLoading = false;
            this.saveBtn.textContent = '💾 Guardar Descripción';
            this.updateSaveButtonState();
        }
    }

    showSaveSuccess() {
        this.saveStatus.textContent = '✅ ¡Descripción guardada correctamente!';
        this.saveStatus.className = 'save-status success';
        
        setTimeout(() => {
            this.clearSaveStatus();
        }, 3000);
    }

    showSaveError(message) {
        this.saveStatus.textContent = `❌ ${message}`;
        this.saveStatus.className = 'save-status error';
        
        setTimeout(() => {
            this.clearSaveStatus();
        }, 5000);
    }

    clearSaveStatus() {
        this.saveStatus.textContent = '';
        this.saveStatus.className = 'save-status';
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PhotoDescriptionManager();
});

// Manejar errores globales
window.addEventListener('error', (e) => {
    console.error('Error global:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rechazada:', e.reason);
});