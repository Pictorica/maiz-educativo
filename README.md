# El Universo del Maíz 🌽

Minisitio educativo interactivo para aprender todo sobre el maíz: historia, tipos, Galicia, nutrición, vídeos y juego de preguntas.

**Proyecto educativo del CEIP RÍA DE VIGO**  
Creado por: Josefina Castillo, Andrea Castro y Ada Palmeíro

## 📁 Estructura del Proyecto

```
maiz-educativo/
├── index.html              # Página principal del minisitio
├── quiz.html               # Quiz interactivo (estilo Typeform - una pregunta a la vez)
├── quiz-typeform.html      # Backup del quiz Typeform original
├── css/
│   ├── style.css          # Estilos globales
│   └── quiz-typeform.css  # Estilos específicos para quiz Typeform
├── js/
│   ├── main.js            # JavaScript principal
│   ├── quiz-typeform.js   # Lógica del quiz modo Typeform
│   ├── quiz-audio.js      # Gestor de audio (música y efectos)
│   └── supabase-rankings.js # Cliente de Supabase para rankings
├── src/
│   ├── lib/               # Módulos ES6 (versiones alternativas)
│   ├── components/        # Componentes HTML reutilizables
│   └── styles/            # Estilos adicionales
├── public/
│   └── audio/             # Archivos de audio del quiz
├── db/
│   └── supabase_rankings.sql # Migración de base de datos
├── docs/
│   └── INTEGRATION_SUPABASE.md # Guía de integración con Supabase
└── pages/
    └── recetas/           # Páginas de recetas con maíz
```

## 🎮 Quiz Interactivo

### Quiz Principal (`quiz.html`)
- **Una pregunta por pantalla** (estilo Typeform)
- Navegación secuencial con botones Anterior/Siguiente
- **Temporizador por pregunta** (30 segundos por defecto)
- Barra de progreso visual
- Auto-guardado en cada respuesta
- Modos: Básico (10 preguntas) y Experto (15 preguntas)
- **🎵 Audio integrado**: Música de fondo y efectos de sonido
- **☁️ Rankings en la nube**: Integración con Supabase (opcional)
- Sistema de ranking local (localStorage)
- Feedback educativo inmediato

### 🎵 Audio Features
- **Música de fondo**: Loop continuo durante el quiz
- **Efectos de sonido**:
  - ✅ Respuesta correcta
  - ❌ Respuesta incorrecta
  - 🎉 Finalización del quiz
- Se activa con la primera interacción del usuario (botón "Comenzar")
- Ver `public/audio/README.md` para recursos de audio gratuitos

### ☁️ Supabase Integration
- Rankings guardados en la nube (opcional)
- Sincronización automática al finalizar quiz
- Fallback a localStorage si Supabase no está configurado
- Ver `docs/INTEGRATION_SUPABASE.md` para instrucciones de configuración

## ⚙️ Configuración del Temporizador

El temporizador por pregunta puede configurarse mediante el atributo `data-timer-default` en el contenedor:

```html
<main class="quiz-typeform-container" data-timer-default="45">
  <!-- 45 segundos por pregunta -->
</main>
```

Por defecto es 30 segundos si no se especifica.

## 💾 Almacenamiento

### Local (localStorage):

1. **Ranking** (`maizQuizRanking`)
   - Top 10 mejores puntuaciones locales
   - Incluye nombre, puntuación, total y modo

2. **Sesión del Quiz** (`maizQuizTypeform:session`)
   - Auto-guardado del progreso actual
   - Respuestas por pregunta
   - Modo seleccionado (Básico/Experto)
   - Permite continuar quiz interrumpido

### Cloud (Supabase - Opcional):

- Rankings sincronizados en la nube
- Tabla `public.rankings` con scores de todos los jugadores
- Configuración opcional - ver `docs/INTEGRATION_SUPABASE.md`
- Si no está configurado, usa solo localStorage

## 🎨 Características del Quiz

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
- ✅ Sistema de puntuación y ranking
- ✅ Feedback educativo por respuesta

## 🧪 Pruebas Manuales Sugeridas

### Caso 1: Inicio del Quiz
- [ ] Abrir `quiz.html`
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
- [ ] Verificar en móvil (responsive)
- [ ] Verificar en tablet
- [ ] Verificar en desktop

## 🔧 Desarrollo

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Node.js (opcional, solo para gestionar dependencias de Supabase)
- HTML5 + CSS3 + JavaScript vanilla

### Instalación (Opcional - solo si quieres usar Supabase)

```bash
npm install
```

### Servidor Local

Para desarrollo, usa un servidor HTTP local:

```bash
# Opción 1: Python (recomendado)
npm run dev
# o
python3 -m http.server 8000

# Opción 2: Node.js
npx http-server -p 8000

# Opción 3: PHP
php -S localhost:8000
```

Luego abre http://localhost:8000/quiz.html

### Configuración de Supabase (Opcional)

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el SQL en `db/supabase_rankings.sql`
3. Copia `config.example.js` a `config.js`
4. Añade tus credenciales de Supabase en `config.js`
5. Ver guía completa en `docs/INTEGRATION_SUPABASE.md`

### Audio Files

1. Descarga archivos de audio gratuitos (ver `public/audio/README.md`)
2. Colócalos en `public/audio/`:
   - `bg-loop.mp3` - Música de fondo
   - `correct.wav` - Sonido correcto
   - `wrong.wav` - Sonido incorrecto
   - `finish.mp3` - Sonido final

### Despliegue
El sitio es estático y puede desplegarse en:
- GitHub Pages
- Vercel (recomendado - configurar env vars)
- Netlify
- Cualquier hosting estático

## 📝 Notas Técnicas

### Decisiones de Diseño
1. **Quiz Typeform como predeterminado**: El quiz.html ahora utiliza el formato Typeform (una pregunta a la vez) como la experiencia principal, ya que proporciona mejor enfoque y es más adecuado para dispositivos móviles.

2. **Estilos scoped**: Los estilos de `quiz-typeform.css` están prefijados con clases específicas para evitar conflictos con estilos globales.

3. **localStorage**: Se usa `maizQuizRanking` para guardar el ranking localmente en el navegador.

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
