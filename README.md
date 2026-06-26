<p align="center">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" width="64" />
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" width="64" />
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png" width="64" />
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png" width="64" />
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png" width="64" />
</p>

<h1 align="center">PokéGarra</h1>

<p align="center">
  <strong>Colección Kanto · 151 Pokémon · Máquina de garra · Speedrun · Leaderboard</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-0a84ff?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-df50ff?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Pokémon-Kanto_151-ffd60a" alt="Kanto 151" />
</p>

---

## Qué es PokéGarra

Una app React local donde **atrapas Pokémon con una máquina de garra virtual**. Completa la Pokédex de Kanto (los 151 originales), compite contra el cronómetro en modo speedrun y compara tus marcas con una clasificación de bots.

Todo en español, tema oscuro, responsive para escritorio y móvil.

| <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" width="48" /> | <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png" width="48" /> | <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png" width="48" /> | <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png" width="48" /> | <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png" width="48" /> | <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png" width="48" /> | <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png" width="48" /> | <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png" width="48" /> | <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png" width="48" /> | <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png" width="48" /> | <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png" width="48" /> |
|---|---|---|---|---|---|---|---|---|---|---|

---

## Cómo arrancar

```bash
cd app
npm install
npm run dev
```

Se abre en `http://localhost:5173`.

---

## Funcionalidades

### Máquina de garra
- **Joystick** en pantalla o **teclas de flecha** para mover la garra. Espacio para agarrar.
- Animaciones completas: física de colisión, bandeja de salida, confeti al acertar, vibración al fallar.
- Pool de 14 Pokémon rotatorios en la máquina. Se reponen automáticamente al completarlos.

### Colección Kanto (151 cartas)
- Cuadrícula de **151 cartas coleccionables** con diseño tipo TCG.
- Cada carta muestra: sprite oficial, nombre, tipo, rareza y poder.
- Las no capturadas salen en **escala de grises**. Las capturadas se revelan con animación.
- **Click en cualquier carta capturada** abre un modal detallado con información completa, efecto holográfico y diseño inspirado en cartas Pokémon.

### Sistema de rareza y poder
| Rareza | Color | Ejemplos |
|---|---|---|
| Común | Gris | Pikachu, Charmander, Bulbasaur |
| Raro | Verde | Jigglypuff, Psyduck, Snorlax |
| Épico | Púrpura | Gengar, Dragonite, Charizard |
| Legendario | Dorado | Mew, Mewtwo, Articuno, Zapdos, Moltres |

Cada Pokémon tiene un valor de **poder** (200–680) que suma puntos al capturarlo.

### Modo Speedrun — Captura los 151
- Actívalo desde el botón **"Desafío: Capturar los 151"** en el panel lateral.
- La colección se resetea a cero y arranca un **cronómetro en tiempo real**.
- Barra de progreso y contador visible en todo momento.
- Al llegar a 151, el cronómetro **se para automáticamente**.
- Se guarda tu **mejor marca personal** en el navegador.

### Clasificación Online (bots)
- **18 bots falsos** con nombres de personajes de Pokémon y tiempos entre 18 y 55 minutos.
- Top 3 con colores **oro, plata y bronce**.
- Tu entrada resaltada en azul.
- Da sensación de competencia real sin necesidad de backend.

### Sonido y estética
- **Cry OGG oficial** de cada Pokémon al capturarlo (desde PokeAPI CDN).
- Sprites **official-artwork** de alta calidad para la máquina.
- Sprites **HOME** (512px) disponibles para vista detallada.
- Efectos de confeti, vibración, holograma y animaciones fluidas en toda la UI.
- Tema oscuro unificado con tipografía Inter y paleta de colores iOS.

---

## Estructura del proyecto

```
app/
├── src/
│   ├── features/
│   │   └── playcaptcha/
│   │       ├── ClawCaptcha.tsx    ← Máquina de garra (componente core)
│   │       ├── clawArt.ts         ← Renderizado canvas de las piezas
│   │       ├── clawcaptcha.css    ← Estilos de la garra
│   │       ├── kantoPokedex.ts    ← Datos de los 151 Pokémon
│   │       ├── toys.ts            ← Catálogo con URLs de sprites/cries
│   │       └── CardModal.tsx      ← Modal de carta detallada
│   ├── App.tsx                    ← Lógica principal, speedrun, leaderboard
│   ├── main.tsx                   ← Entry point
│   └── style.css                  ← Estilos globales + cartas + speedrun
├── index.html
├── package.json
└── vite.config.ts
```

---

## APIs y recursos utilizados

| Recurso | URL base |
|---|---|
| Sprites oficiales | `PokeAPI/sprites/other/official-artwork/{id}.png` |
| Sprites HOME (512px) | `PokeAPI/sprites/other/home/{id}.png` |
| Sonidos (cries) | `PokeAPI/cries/main/cries/pokemon/latest/{id}.ogg` |

Todo desde el CDN gratuito de [PokeAPI](https://github.com/PokeAPI/sprites), sin dependencias externas.

---

## Ideas futuras

- [ ] Mapa de Kanto con gimnasios y zonas
- [ ] Minijuego de Memoria Pokéball
- [ ] Minijuego Laberinto Safari
- [ ] Sistema de evoluciones
- [ ] Modo batalla con los Pokémon capturados
- [ ] Sincronización en la nube (Firebase / Supabase)

---

## Licencia

MIT — diviértete.
