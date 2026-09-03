# SalazarTurismo — Contexto del proyecto

Sitio web turístico de Salazar de las Palmas (Norte de Santander, Colombia) con una
experiencia de realidad aumentada. Proyecto académico heredado: lo empezó otro equipo
y quedó a medias. Yo lo retomé sin documentación.

## Objetivo final

Que el visitante escanee con la cámara del celular un afiche impreso de un sitio
turístico y aparezca un personaje 3D que se mueve y **narra la historia del lugar con
voz**. La voz es la pieza clave y es justo lo que falta.

## Stack

Sitio estático puro. **No hay build, ni framework, ni `package.json`, ni backend.**
Todo se sirve tal cual. Las librerías entran por CDN:

- **A-Frame 1.4.2** — motor 3D declarativo (escena, cámara, entidades).
- **MindAR 1.2.2** (`mindar-image-aframe`) — tracking de imagen.
- **aframe-extras 6.1.1** — aporta `animation-mixer` para las animaciones GLTF.
- FontAwesome 6.4 y Google Fonts (Outfit) para la parte web.

## Estructura

```
index.html            Portada (hero, historia, tarjetas, galería, footer)
naturaleza.html       Página interna
cultura.html          Página interna
aventura.html         Página interna
ar.html               TODA la experiencia AR (autónoma, no depende de main.js)
css/style.css         Variables :root, reset, tipografía, layout, animaciones
css/components.css    10 bloques comentados: Botones, Navbar, Hero, Historia,
                      Tarjetas, Galería, Lightbox, WebAR Overlay, Footer, Responsive
js/main.js            Menú móvil, navbar con scroll, IntersectionObserver,
                      lightbox de galería, redirección al AR
Recursos/             Imágenes, logos, targets, modelos 3D
Recursos/TargetsAR/   4 JPG de los afiches + targets.mind compilado
Recursos/Animaciones/ PlazaCentral.glb
Recursos/Audios/      (a crear) voces de los personajes
```

### Convenciones importantes

- **El navbar y el footer están duplicados a mano en las 4 páginas.** No hay includes
  ni plantillas. Cualquier cambio de menú o footer hay que replicarlo en `index.html`,
  `cultura.html`, `aventura.html` y `naturaleza.html`.
- Los colores viven en variables CSS en `css/style.css`:
  `--color-primary: #006b3f` (verde institucional),
  `--color-accent: #e5b920` (dorado). Nunca hardcodear hex nuevos.
- Hay rutas con **espacios y extensiones en mayúscula** (`Recursos/Galeria Visual/`,
  `Naturaleza 1.JPG`). En servidor Linux distinguen mayúsculas: respetar exacto.
- La galería usa el atributo `data-images` con un array JSON; `main.js` lo parsea.

## Estado del contenido AR

`targets.mind` está compilado con **4 targets** (verificado leyendo el binario:
3 imágenes de 2560×2560 y una de 1254×1254, que corresponde a `TargetPatinaje.jpg`
en el índice 1).

| targetIndex | Sitio | Estado |
|---|---|---|
| 0 | Plaza Central | Modelo 3D real, **sin voz** |
| 1 | Pista de Patinaje | Cubo de relleno |
| 2 | Iglesia de San Pablo | Cubo de relleno |
| 3 | Los 7 Chorros (¿?) | Cubo de relleno, etiqueta dudosa |

El índice 3 estaba etiquetado como "Santuario Virgen de Belén" pero la cuarta imagen
compilada es `Target7Chorros.jpg`. Sin confirmar. Se verifica abriendo
`ar.html?debug=1` y escaneando cada afiche: el panel muestra el índice detectado.

### El modelo `PlazaCentral.glb`

- 30.4 MB, de los cuales **24.6 MB son texturas** (12.1 MB color base, 6.6 MB
  metallic/roughness, 5.3 MB normal). Exportado desde Blender.
- Rig tipo Rigify, 40 nodos, skinning, 9475 vértices.
- **Una sola animación: `rigAction`, de 77.2 segundos.**
- Incluye huesos `DEF-mandibula.superior` y `DEF-mandibula.inferior` animados
  → el personaje ya está animado hablando. La voz debe durar ~77 s para calzar.

## Tareas pendientes, por prioridad

1. **Grabar la voz de la Plaza Central** → `Recursos/Audios/PlazaCentral.mp3`.
   Sin esto el personaje mueve la boca en silencio.
2. **Comprimir el GLB.** 30 MB es inviable en datos móviles.
   `gltf-transform optimize in.glb out.glb --texture-size 1024 --texture-compress webp`
3. **Confirmar el orden real de los targets** con `ar.html?debug=1`.
4. **Contenido para los targets 1, 2 y 3** (modelo propio o reutilizar el personaje
   con audio distinto por sitio).
5. Escribir los subtítulos de cada narración.
6. Publicar en HTTPS (GitHub Pages sirve). **MindAR no accede a la cámara en
   `file://` ni en `http://`.**

## Cómo funciona `ar.html` (versión reescrita)

Cada experiencia se configura con atributos `data-*` en la entidad del target:

```html
<a-entity mindar-image-target="targetIndex: 0" experiencia-ar
  data-nombre="Plaza Central"
  data-audio="Recursos/Audios/PlazaCentral.mp3"
  data-subtitulos='[{"t":0,"texto":"..."},{"t":6.5,"texto":"..."}]'>
  <a-gltf-model src="#modeloPlaza" animation-mixer="clip: *; loop: once; timeScale: 0">
  </a-gltf-model>
</a-entity>
```

El componente `experiencia-ar` sincroniza animación y voz: al detectar el target
rebobina el mixer a 0 y lanza el audio en el mismo instante.

### Decisiones que NO hay que revertir

- **`autoStart: false` y la pantalla inicial con botón.** iOS y Chrome móvil bloquean
  `audio.play()` y la cámara si no hay un gesto previo del usuario. Sin ese botón el
  personaje queda mudo en celular. No es decoración.
- **`look-controls="enabled: false"` en la cámara.** En MindAR la cámara va fija en el
  origen y son los anclajes los que se mueven. Si la cámara rota, el modelo se despega
  del target.
- **La visibilidad persistente se mantiene en `tick()`**, no con `setTimeout`. MindAR
  oculta la entidad al perder el target y queremos que el personaje siga visible
  mientras narra 77 segundos.
- El `<div id="arOverlay">` con iframe al final de `index.html` es **código muerto**:
  fue un intento abandonado de meter el AR en un modal, falla el permiso de cámara en
  iframes móviles. `main.js` redirige a `ar.html`. Se puede borrar.

## Cómo probar

```bash
npx serve          # servidor local
```
Para probar en el celular hace falta HTTPS: túnel tipo ngrok, o publicar en GitHub Pages.
Con Live Server de VS Code basta para la parte web, pero el AR necesita HTTPS.
