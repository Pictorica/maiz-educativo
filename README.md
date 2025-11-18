# El Universo del Maíz 🌽

Minisitio educativo interactivo para aprender todo sobre el maíz: historia, tipos, Galicia, nutrición, vídeos y juego de preguntas.

**Proyecto educativo del CEIP RÍA DE VIGO**  
Creado por: Josefina Castillo, Andrea Castro y Ada Palmeíro

## 📁 Estructura del Proyecto

```
maiz-educativo/
├── index.html              # Página principal del minisitio
├── quiz.html               # Quiz clásico (todas las preguntas visibles)
├── quiz-typeform.html      # Quiz modo Typeform (una pregunta a la vez)
├── css/
│   ├── style.css          # Estilos globales
│   └── quiz-typeform.css  # Estilos específicos para modo Typeform
├── js/
│   ├── main.js            # JavaScript principal y feature flags
│   └── quiz-typeform.js   # Lógica del quiz modo Typeform
└── pages/
    └── recetas/           # Páginas de recetas con maíz
```

## 🎮 Modos de Quiz

### Quiz Clásico (`quiz.html`)
- Todas las preguntas visibles a la vez
- Respuesta inmediata con feedback
- Modos: Básico (10 preguntas) y Experto (15 preguntas)

### Quiz Typeform (`quiz-typeform.html`) ✨ NUEVO
- Una pregunta por pantalla
- Navegación secuencial con botones Anterior/Siguiente
- Temporizador por pregunta (30 segundos por defecto)
- Barra de progreso visual
- Auto-guardado en cada respuesta
- Mismo sistema de ranking que el quiz clásico

## 🚀 Feature Flag: Modo Typeform

El modo Typeform puede activarse de dos formas:

### Opción 1: URL Parameter
Añade `?typeform=1` a la URL del quiz clásico:
```
https://tu-sitio.com/quiz.html?typeform=1
```
Esto redirigirá automáticamente a `quiz-typeform.html`.

### Opción 2: Variable Global
Define la variable antes de cargar `main.js`:
```html
<script>
  window.USE_TYPEFORM_QUIZ = true;
</script>
<script src="js/main.js" defer></script>
```

### Opción 3: Enlace Directo
Simplemente navega a:
```
https://tu-sitio.com/quiz-typeform.html
```

## ⚙️ Configuración del Temporizador

El temporizador por pregunta puede configurarse mediante el atributo `data-timer-default` en el contenedor:

```html
<main class="quiz-typeform-container" data-timer-default="45">
  <!-- 45 segundos por pregunta -->
</main>
```

Por defecto es 30 segundos si no se especifica.

## 💾 Almacenamiento Local

### Datos guardados en localStorage:

1. **Ranking compartido** (`maizQuizRanking`)
   - Compartido entre quiz clásico y modo Typeform
   - Top 10 mejores puntuaciones
   - Incluye nombre, puntuación, total y modo

2. **Sesión Typeform** (`maizQuizTypeform:session`)
   - Auto-guardado del progreso actual
   - Respuestas por pregunta
   - Modo seleccionado (Básico/Experto)
   - Permite continuar quiz interrumpido

## 🎨 Características del Modo Typeform

### UX/Accesibilidad
- ✅ Diseño mobile-first optimizado para niños de 10 años
- ✅ Botones grandes y táctiles
- ✅ Texto grande y legible
- ✅ Temporizador visual con colores:
  - 🟢 Verde: > 10 segundos
  - 🟡 Amarillo: 6-10 segundos
  - 🔴 Rojo: 1-5 segundos (con animación)
- ✅ Animaciones suaves de transición
- ✅ Soporte para navegación hacia atrás (revisar respuestas)
- ✅ Feedback visual inmediato

### Funcionalidad
- ✅ Bloqueo de avance sin respuesta
- ✅ Auto-advance cuando expira el tiempo
- ✅ Filtrado por nivel (Básico/Experto)
- ✅ Reutilización de preguntas existentes
- ✅ Mismo sistema de puntuación

## 🧪 Pruebas Manuales Sugeridas

### Caso 1: Inicio del Quiz
- [ ] Abrir `quiz-typeform.html`
- [ ] Verificar que se muestra solo la pantalla de configuración
- [ ] Ingresar nombre y seleccionar modo
- [ ] Verificar que el botón "Comenzar Quiz" funciona

### Caso 2: Navegación
- [ ] Verificar que se muestra una sola pregunta
- [ ] Verificar que el botón "Siguiente" está desactivado sin selección
- [ ] Seleccionar una respuesta
- [ ] Verificar que el botón "Siguiente" se activa
- [ ] Verificar que se puede ir a la siguiente pregunta
- [ ] Verificar que el botón "Anterior" funciona

### Caso 3: Temporizador
- [ ] Verificar que el temporizador inicia en 30 segundos
- [ ] Verificar cambio de color a amarillo (10s restantes)
- [ ] Verificar cambio de color a rojo (5s restantes)
- [ ] Dejar que expire el tiempo sin responder
- [ ] Verificar que auto-avanza a la siguiente pregunta

### Caso 4: Guardado y Recuperación
- [ ] Responder algunas preguntas
- [ ] Recargar la página
- [ ] Verificar que aparece el prompt de continuar
- [ ] Aceptar continuar
- [ ] Verificar que se restauran las respuestas

### Caso 5: Finalización
- [ ] Completar todas las preguntas
- [ ] Verificar que se muestra la pantalla de resultados
- [ ] Verificar que se muestra el ranking
- [ ] Verificar que se guardó en `maizQuizRanking`

### Caso 6: Compatibilidad
- [ ] Verificar que `quiz.html` sigue funcionando igual
- [ ] Verificar que el ranking es compartido entre ambos modos
- [ ] Verificar en móvil (responsive)
- [ ] Verificar en tablet
- [ ] Verificar en desktop

## 🔧 Desarrollo

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- No requiere Node.js ni build process
- HTML5 + CSS3 + JavaScript vanilla

### Despliegue
El sitio es estático y puede desplegarse en:
- GitHub Pages
- Vercel
- Netlify
- Cualquier hosting estático

## 📝 Notas Técnicas

### Decisiones de Diseño
1. **Replicación de preguntas**: Las preguntas están duplicadas en `quiz-typeform.html` para simplicidad. Una mejora futura sería extraerlas a un archivo JSON compartido.

2. **Estilos scoped**: Los estilos de `quiz-typeform.css` están prefijados con clases específicas para evitar conflictos con estilos globales.

3. **localStorage**: Se usa el mismo key `maizQuizRanking` para que el ranking sea compartido entre ambos modos.

4. **Timer**: Se implementa con `setInterval` y se limpia correctamente para evitar fugas de memoria.

### Mejoras Futuras
- [ ] Extraer preguntas a JSON compartido
- [ ] Añadir sonidos para el temporizador
- [ ] Vibración en móvil (opcional)
- [ ] Tests E2E automatizados
- [ ] Modo offline (Service Worker)
- [ ] Estadísticas detalladas por pregunta

## 📄 Licencia

Proyecto educativo - CEIP RÍA DE VIGO  
Tutoría tecnológica: [Pictorica.es](https://pictorica.es)

## 🤝 Contribuir

Este es un proyecto educativo. Para sugerencias o mejoras, por favor contacta con el equipo docente del CEIP RÍA DE VIGO.
