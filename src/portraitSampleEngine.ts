/**
 * Enhanced Procedural Generator for Canva-Style Backdrop Library
 * Includes:
 * 1. AI Magic Backdrops (Cyberpunk Neon, Studio Spotlight, Golden Hour Dunes, Abstract Pastel Flow, Luxury Marble, Cosmic Nebula)
 * 2. Scenic / Office / Studio Photo Textures (Executive Modern Office, Modern Brick Wall, Minimalist Fine Art Canvas, Executive Library, Scenic Nature Bokeh, Cozy Cafe Coffeehouse, Architectural Concrete Studio)
 */

export interface PortraitGenerationResult {
  sourceImageUrl: string;
  isolatedCutoutUrl: string;
  maskCanvas: HTMLCanvasElement;
}

/**
 * Procedurally generates a photorealistic portrait of the young man wearing a
 * blue patterned button-up shirt with detailed hair strands and clean alpha mask.
 */
export function generateYoungManSamplePortrait(width = 640, height = 800): PortraitGenerationResult {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })!;

  // 1. Initial Source Background (natural park foliage and trees in background)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#2D4A22');
  bgGrad.addColorStop(0.4, '#4B6B38');
  bgGrad.addColorStop(0.7, '#6E8F52');
  bgGrad.addColorStop(1, '#8BA66E');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Soft background foliage circles
  for (let i = 0; i < 40; i++) {
    const bx = Math.random() * width;
    const by = Math.random() * (height * 0.7);
    const br = 15 + Math.random() * 45;
    ctx.fillStyle = `rgba(${30 + Math.random() * 40}, ${70 + Math.random() * 80}, ${30 + Math.random() * 40}, 0.35)`;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw the subject onto canvas AND onto maskCanvas (maskCtx in pure white #FFFFFF)
  drawSubject(ctx, width, height, false);
  drawSubject(maskCtx, width, height, true);

  const sourceImageUrl = canvas.toDataURL('image/jpeg', 0.98);

  // Create isolated cutout version (transparent PNG)
  const cutoutCanvas = document.createElement('canvas');
  cutoutCanvas.width = width;
  cutoutCanvas.height = height;
  const cutoutCtx = cutoutCanvas.getContext('2d')!;
  drawSubject(cutoutCtx, width, height, false);
  const isolatedCutoutUrl = cutoutCanvas.toDataURL('image/png');

  return {
    sourceImageUrl,
    isolatedCutoutUrl,
    maskCanvas,
  };
}

function drawSubject(ctx: CanvasRenderingContext2D, w: number, h: number, isMask: boolean) {
  const cx = w / 2;
  const headY = h * 0.38;
  const headR = w * 0.22;

  // 1. Torso & Blue Patterned Shirt (Centrally Placed)
  ctx.save();
  if (isMask) {
    ctx.fillStyle = '#FFFFFF';
  } else {
    // Royal/Navy Blue Base Shirt
    ctx.fillStyle = '#1D4ED8';
  }

  // Draw broad shoulders & chest
  ctx.beginPath();
  ctx.ellipse(cx, h * 0.85, w * 0.46, h * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!isMask) {
    // Micro geometric/floral pattern on blue shirt
    ctx.save();
    ctx.clip(); // clip to shirt body
    
    // Draw shirt fabric folds and shading
    const shirtShade = ctx.createLinearGradient(0, h * 0.6, 0, h);
    shirtShade.addColorStop(0, 'rgba(29, 78, 216, 0.95)');
    shirtShade.addColorStop(0.5, 'rgba(30, 58, 138, 0.98)');
    shirtShade.addColorStop(1, 'rgba(15, 23, 42, 1)');
    ctx.fillStyle = shirtShade;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    // Intricate blue printed pattern (diamond/cross micro-dots)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    const spacing = 18;
    for (let py = h * 0.55; py < h; py += spacing) {
      for (let px = 0; px < w; px += spacing) {
        const offset = (Math.floor(py / spacing) % 2) * (spacing / 2);
        const dotX = px + offset;
        ctx.beginPath();
        ctx.arc(dotX, py, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Accent diamond petals
        ctx.fillStyle = 'rgba(147, 197, 253, 0.5)';
        ctx.fillRect(dotX - 3, py - 0.5, 6, 1);
        ctx.fillRect(dotX - 0.5, py - 3, 1, 6);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      }
    }

    // Shirt center placket
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(cx - 14, h * 0.62, 28, h * 0.38);

    // Pearl buttons
    for (let by = h * 0.68; by < h; by += 55) {
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.arc(cx, by, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(cx, by, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
  ctx.restore();

  // 2. Collar
  ctx.save();
  if (isMask) {
    ctx.fillStyle = '#FFFFFF';
  } else {
    ctx.fillStyle = '#2563EB';
  }
  // Left collar
  ctx.beginPath();
  ctx.moveTo(cx - 15, h * 0.58);
  ctx.lineTo(cx - 75, h * 0.64);
  ctx.lineTo(cx - 30, h * 0.69);
  ctx.closePath();
  ctx.fill();

  // Right collar
  ctx.beginPath();
  ctx.moveTo(cx + 15, h * 0.58);
  ctx.lineTo(cx + 75, h * 0.64);
  ctx.lineTo(cx + 30, h * 0.69);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 3. Neck
  ctx.save();
  if (isMask) {
    ctx.fillStyle = '#FFFFFF';
  } else {
    ctx.fillStyle = '#D99B77';
  }
  ctx.beginPath();
  ctx.moveTo(cx - 42, headY + headR * 0.6);
  ctx.lineTo(cx + 42, headY + headR * 0.6);
  ctx.lineTo(cx + 36, h * 0.62);
  ctx.lineTo(cx - 36, h * 0.62);
  ctx.closePath();
  ctx.fill();

  if (!isMask) {
    // Neck shadow under chin
    const neckShade = ctx.createLinearGradient(0, headY + headR * 0.6, 0, h * 0.62);
    neckShade.addColorStop(0, 'rgba(139, 69, 19, 0.45)');
    neckShade.addColorStop(1, 'rgba(139, 69, 19, 0.05)');
    ctx.fillStyle = neckShade;
    ctx.fill();
  }
  ctx.restore();

  // 4. Head & Ears
  ctx.save();
  if (isMask) {
    ctx.fillStyle = '#FFFFFF';
  } else {
    ctx.fillStyle = '#E8AC88';
  }

  // Left Ear
  ctx.beginPath();
  ctx.ellipse(cx - headR * 0.95, headY + 5, headR * 0.22, headR * 0.35, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Right Ear
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.95, headY + 5, headR * 0.22, headR * 0.35, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Face oval
  ctx.beginPath();
  ctx.ellipse(cx, headY, headR * 0.88, headR * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!isMask) {
    // Face subtle skin lighting
    const faceLight = ctx.createRadialGradient(cx + 20, headY - 20, 10, cx, headY, headR * 1.1);
    faceLight.addColorStop(0, 'rgba(255, 235, 220, 0.35)');
    faceLight.addColorStop(0.6, 'rgba(220, 150, 110, 0.1)');
    faceLight.addColorStop(1, 'rgba(160, 90, 50, 0.25)');
    ctx.fillStyle = faceLight;
    ctx.fill();

    // Eyebrows
    ctx.fillStyle = '#1F1713';
    // Left eyebrow
    ctx.beginPath();
    ctx.ellipse(cx - 45, headY - 32, 28, 6, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Right eyebrow
    ctx.beginPath();
    ctx.ellipse(cx + 45, headY - 32, 28, 6, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    // Sclera
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(cx - 45, headY - 14, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 45, headY - 14, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris (Deep brown)
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.arc(cx - 45, headY - 14, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 45, headY - 14, 8.5, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx - 45, headY - 14, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 45, headY - 14, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights (glint)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - 47, headY - 17, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 43, headY - 17, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.strokeStyle = '#B87A58';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, headY - 20);
    ctx.lineTo(cx - 3, headY + 22);
    ctx.lineTo(cx + 6, headY + 24);
    ctx.stroke();

    // Lips / Smile
    ctx.fillStyle = '#C86D51';
    ctx.beginPath();
    ctx.ellipse(cx, headY + 54, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8D3A24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 24, headY + 54);
    ctx.quadraticCurveTo(cx, headY + 58, cx + 24, headY + 54);
    ctx.stroke();
  }
  ctx.restore();

  // 5. Hair (Detailed texture with strands and volume)
  ctx.save();
  if (isMask) {
    ctx.fillStyle = '#FFFFFF';
  } else {
    ctx.fillStyle = '#1A120B'; // Dark brown / black hair
  }

  // Hair base volume
  ctx.beginPath();
  ctx.ellipse(cx, headY - headR * 0.55, headR * 0.96, headR * 0.82, 0, Math.PI * 0.9, Math.PI * 2.1);
  ctx.fill();

  // Hair sides
  ctx.beginPath();
  ctx.ellipse(cx - headR * 0.72, headY - headR * 0.15, headR * 0.35, headR * 0.55, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + headR * 0.72, headY - headR * 0.15, headR * 0.35, headR * 0.55, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Front styled quiff strands
  for (let i = -6; i <= 6; i++) {
    const sx = cx + i * 14;
    const sy = headY - headR * 0.75 - Math.abs(i) * 3;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 18, 28, (i * 0.08), 0, Math.PI * 2);
    ctx.fill();
  }

  if (!isMask) {
    // Hair Highlights (Soft studio sheen)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx + headR * 0.15, headY - headR * 0.75, headR * 0.4, -0.3 * Math.PI, 0.2 * Math.PI);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Procedural Generator for Realistic Photo Backdrops & Magic AI Presets
 */
export function generateProceduralBackdrop(
  type: string,
  width = 800,
  height = 1000
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // ----------------------------------------------------
  // PHOTO PRESETS
  // ----------------------------------------------------
  if (type === 'modern_office' || type === 'office') {
    // Executive glass & steel modern corporate office
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#1E293B');
    bg.addColorStop(0.4, '#334155');
    bg.addColorStop(1, '#0F172A');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Glass window mullions & warm interior lights
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    for (let x = width * 0.2; x < width; x += width * 0.25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = height * 0.25; y < height; y += height * 0.3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Warm bokeh city skyscraper lights through blurred glass
    for (let i = 0; i < 30; i++) {
      const lx = Math.random() * width;
      const ly = Math.random() * (height * 0.8);
      const lr = 12 + Math.random() * 35;
      const colors = ['rgba(253, 224, 71, 0.25)', 'rgba(59, 130, 246, 0.2)', 'rgba(255, 255, 255, 0.3)'];
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'brick_wall') {
    // Modern warm brick wall with soft focus
    ctx.fillStyle = '#642B23';
    ctx.fillRect(0, 0, width, height);

    const brickH = 34;
    const brickW = 84;
    const mortar = 4;

    for (let y = 0; y < height; y += brickH + mortar) {
      const rowIdx = Math.floor(y / (brickH + mortar));
      const offsetX = (rowIdx % 2) * (brickW / 2);

      for (let x = -brickW; x < width + brickW; x += brickW + mortar) {
        const bx = x + offsetX;
        const colorVar = (rowIdx * 17 + Math.floor(x / 30)) % 5;
        const colors = ['#8C382A', '#7A2E22', '#964434', '#66261B', '#833427'];
        ctx.fillStyle = colors[colorVar];
        ctx.fillRect(bx, y, brickW, brickH);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(bx, y + brickH - 4, brickW, 4);
      }
    }

    // Soft warm ambient studio lighting falloff
    const light = ctx.createRadialGradient(width * 0.5, height * 0.35, 100, width * 0.5, height * 0.5, width * 0.8);
    light.addColorStop(0, 'rgba(255, 235, 200, 0.25)');
    light.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
    light.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'studio_canvas') {
    // Minimalist fine-art textured portrait canvas
    const base = ctx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, '#E2E8F0');
    base.addColorStop(0.5, '#CBD5E1');
    base.addColorStop(1, '#94A3B8');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    // Vignette
    const vig = ctx.createRadialGradient(width * 0.5, height * 0.45, 120, width * 0.5, height * 0.5, width * 0.75);
    vig.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    vig.addColorStop(0.6, 'rgba(100, 116, 139, 0.1)');
    vig.addColorStop(1, 'rgba(15, 23, 42, 0.65)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'library') {
    // Executive warm bookshelf library with gentle bokeh
    ctx.fillStyle = '#2A1810';
    ctx.fillRect(0, 0, width, height);

    const shelfH = 110;
    for (let sy = 30; sy < height; sy += shelfH) {
      ctx.fillStyle = '#4A2818';
      ctx.fillRect(0, sy + shelfH - 14, width, 14);

      let bx = 10;
      while (bx < width - 20) {
        const bw = 14 + Math.random() * 26;
        const bh = shelfH - 24 - Math.random() * 15;
        const colors = ['#8B1E1E', '#1E3A8A', '#1E4D2B', '#C29D38', '#5B3A29', '#374151'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(bx, sy + shelfH - 14 - bh, bw, bh);

        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.fillRect(bx + 3, sy + shelfH - 14 - bh + 8, bw - 6, 2);

        bx += bw + 3;
      }
    }

    const overlay = ctx.createRadialGradient(width * 0.5, height * 0.4, 80, width * 0.5, height * 0.5, width * 0.85);
    overlay.addColorStop(0, 'rgba(255, 220, 160, 0.3)');
    overlay.addColorStop(0.5, 'rgba(40, 20, 10, 0.5)');
    overlay.addColorStop(1, 'rgba(15, 10, 5, 0.85)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'outdoor_bokeh') {
    // Scenic natural sunlight & bokeh greenery
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#7DD3FC');
    sky.addColorStop(0.4, '#BAE6FD');
    sky.addColorStop(0.7, '#86EFAC');
    sky.addColorStop(1, '#15803D');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const sun = ctx.createRadialGradient(width * 0.8, height * 0.15, 20, width * 0.8, height * 0.15, width * 0.6);
    sun.addColorStop(0, 'rgba(255, 255, 200, 0.85)');
    sun.addColorStop(0.5, 'rgba(253, 224, 71, 0.35)');
    sun.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 45; i++) {
      const ox = Math.random() * width;
      const oy = Math.random() * height;
      const or = 20 + Math.random() * 60;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + Math.random() * 0.25})`;
      ctx.beginPath();
      ctx.arc(ox, oy, or, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'cozy_cafe') {
    // Warm European coffeehouse atmosphere with pendant lamps
    const cafe = ctx.createLinearGradient(0, 0, width, height);
    cafe.addColorStop(0, '#3F2212');
    cafe.addColorStop(0.6, '#57331C');
    cafe.addColorStop(1, '#24140B');
    ctx.fillStyle = cafe;
    ctx.fillRect(0, 0, width, height);

    // Warm glow lights
    for (let i = 0; i < 5; i++) {
      const lx = (width * 0.15) + (i * width * 0.18);
      const ly = height * 0.22;
      const lampGrad = ctx.createRadialGradient(lx, ly, 10, lx, ly, 110);
      lampGrad.addColorStop(0, 'rgba(255, 220, 130, 0.7)');
      lampGrad.addColorStop(0.5, 'rgba(234, 138, 38, 0.25)');
      lampGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lampGrad;
      ctx.beginPath();
      ctx.arc(lx, ly, 110, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'architectural_concrete') {
    // Brutalist minimal studio with geometric light angles
    const conc = ctx.createLinearGradient(0, 0, width, height);
    conc.addColorStop(0, '#94A3B8');
    conc.addColorStop(0.5, '#64748B');
    conc.addColorStop(1, '#475569');
    ctx.fillStyle = conc;
    ctx.fillRect(0, 0, width, height);

    // Soft angled shaft of morning window light
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(width * 0.2, 0);
    ctx.lineTo(width * 0.75, 0);
    ctx.lineTo(width * 0.95, height);
    ctx.lineTo(width * 0.4, height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fill();
    ctx.restore();

  // ----------------------------------------------------
  // MAGIC AI PRESETS (20+ Rich Diverse Themes)
  // ----------------------------------------------------
  } else if (type === 'magic_studio_spotlight' || type === 'magic_spotlight_studio') {
    // Dramatic charcoal black studio with single center spotlight
    ctx.fillStyle = '#0A0A0B';
    ctx.fillRect(0, 0, width, height);

    const spot = ctx.createRadialGradient(width * 0.5, height * 0.38, 30, width * 0.5, height * 0.42, width * 0.55);
    spot.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    spot.addColorStop(0.35, 'rgba(200, 220, 245, 0.35)');
    spot.addColorStop(0.7, 'rgba(40, 50, 70, 0.15)');
    spot.addColorStop(1, 'rgba(10, 10, 11, 0)');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'magic_golden_hour') {
    // Warm sun-drenched golden hour sunset
    const sunset = ctx.createLinearGradient(0, 0, 0, height);
    sunset.addColorStop(0, '#D97706');
    sunset.addColorStop(0.35, '#EA580C');
    sunset.addColorStop(0.7, '#C2410C');
    sunset.addColorStop(1, '#451A03');
    ctx.fillStyle = sunset;
    ctx.fillRect(0, 0, width, height);

    const sun = ctx.createRadialGradient(width * 0.5, height * 0.3, 20, width * 0.5, height * 0.3, width * 0.75);
    sun.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
    sun.addColorStop(0.4, 'rgba(251, 191, 36, 0.45)');
    sun.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'magic_cyberpunk_neon') {
    // Dark moody synthwave / cyberpunk neon backdrop
    ctx.fillStyle = '#090514';
    ctx.fillRect(0, 0, width, height);

    // Neon Pink Left Rim
    const pinkGlow = ctx.createRadialGradient(width * 0.1, height * 0.4, 20, width * 0.1, height * 0.4, width * 0.65);
    pinkGlow.addColorStop(0, 'rgba(244, 63, 94, 0.7)');
    pinkGlow.addColorStop(0.5, 'rgba(217, 70, 239, 0.3)');
    pinkGlow.addColorStop(1, 'rgba(9, 5, 20, 0)');
    ctx.fillStyle = pinkGlow;
    ctx.fillRect(0, 0, width, height);

    // Neon Cyan Right Rim
    const cyanGlow = ctx.createRadialGradient(width * 0.9, height * 0.6, 20, width * 0.9, height * 0.6, width * 0.7);
    cyanGlow.addColorStop(0, 'rgba(6, 182, 212, 0.75)');
    cyanGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
    cyanGlow.addColorStop(1, 'rgba(9, 5, 20, 0)');
    ctx.fillStyle = cyanGlow;
    ctx.fillRect(0, 0, width, height);

    // Micro grid lines in background
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.lineWidth = 1.5;
    for (let y = height * 0.4; y < height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

  } else if (type === 'magic_luxury_marble' || type === 'magic_marble_luxury') {
    // Carrara White & Gold Luxury Marble Texture
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.2);
    ctx.bezierCurveTo(width * 0.3, height * 0.35, width * 0.6, height * 0.15, width, height * 0.4);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)'; // Gold vein
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.1, 0);
    ctx.bezierCurveTo(width * 0.4, height * 0.4, width * 0.7, height * 0.6, width * 0.9, height);
    ctx.stroke();

    const luxVig = ctx.createRadialGradient(width * 0.5, height * 0.5, 100, width * 0.5, height * 0.5, width * 0.75);
    luxVig.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    luxVig.addColorStop(1, 'rgba(15, 23, 42, 0.18)');
    ctx.fillStyle = luxVig;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'magic_cosmic_nebula') {
    // Deep galaxy cosmic nebula with starry glow
    const space = ctx.createLinearGradient(0, 0, width, height);
    space.addColorStop(0, '#030712');
    space.addColorStop(0.5, '#1E1B4B');
    space.addColorStop(1, '#020617');
    ctx.fillStyle = space;
    ctx.fillRect(0, 0, width, height);

    const purpleDust = ctx.createRadialGradient(width * 0.35, height * 0.35, 10, width * 0.35, height * 0.35, width * 0.55);
    purpleDust.addColorStop(0, 'rgba(168, 85, 247, 0.7)');
    purpleDust.addColorStop(0.6, 'rgba(79, 70, 229, 0.25)');
    purpleDust.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = purpleDust;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 70; i++) {
      const sx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
      const sy = (Math.cos(i * 33) * 0.5 + 0.5) * height;
      const sr = 0.8 + (i % 3) * 0.7;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (type === 'magic_pastel_abstract') {
    // Smooth dreamy pastel fluid waves
    const pastel = ctx.createLinearGradient(0, 0, width, height);
    pastel.addColorStop(0, '#E0E7FF');
    pastel.addColorStop(0.35, '#FCE7F3');
    pastel.addColorStop(0.7, '#FEF3C7');
    pastel.addColorStop(1, '#CCFBF1');
    ctx.fillStyle = pastel;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(244, 114, 182, 0.2)';
    ctx.beginPath();
    ctx.ellipse(width * 0.3, height * 0.3, width * 0.4, height * 0.25, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(129, 140, 248, 0.2)';
    ctx.beginPath();
    ctx.ellipse(width * 0.7, height * 0.7, width * 0.45, height * 0.3, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'magic_cinematic_teal_orange') {
    // Hollywood blockbuster cinematic dual-tone lighting
    ctx.fillStyle = '#080E14';
    ctx.fillRect(0, 0, width, height);

    const orangeLight = ctx.createRadialGradient(width * 0.15, height * 0.3, 10, width * 0.15, height * 0.3, width * 0.7);
    orangeLight.addColorStop(0, 'rgba(249, 115, 22, 0.85)');
    orangeLight.addColorStop(0.5, 'rgba(234, 88, 12, 0.3)');
    orangeLight.addColorStop(1, 'rgba(8, 14, 20, 0)');
    ctx.fillStyle = orangeLight;
    ctx.fillRect(0, 0, width, height);

    const tealLight = ctx.createRadialGradient(width * 0.85, height * 0.7, 10, width * 0.85, height * 0.7, width * 0.75);
    tealLight.addColorStop(0, 'rgba(20, 184, 166, 0.8)');
    tealLight.addColorStop(0.5, 'rgba(13, 148, 136, 0.3)');
    tealLight.addColorStop(1, 'rgba(8, 14, 20, 0)');
    ctx.fillStyle = tealLight;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'magic_bokeh_nature') {
    // Lush Emerald Rainforest with Sunflare Bokeh
    const nature = ctx.createLinearGradient(0, 0, 0, height);
    nature.addColorStop(0, '#064E3B');
    nature.addColorStop(0.5, '#065F46');
    nature.addColorStop(1, '#022C22');
    ctx.fillStyle = nature;
    ctx.fillRect(0, 0, width, height);

    const sunflare = ctx.createRadialGradient(width * 0.8, height * 0.15, 10, width * 0.8, height * 0.15, width * 0.6);
    sunflare.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
    sunflare.addColorStop(0.4, 'rgba(167, 243, 208, 0.4)');
    sunflare.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunflare;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 35; i++) {
      const bx = ((i * 37) % width);
      const by = ((i * 73) % (height * 0.85));
      const br = 15 + (i % 6) * 8;
      ctx.fillStyle = `rgba(110, 231, 183, ${0.15 + (i % 5) * 0.05})`;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (type === 'magic_minimalist_loft') {
    // Minimalist Scandinavian Glass Penthouse
    const loft = ctx.createLinearGradient(0, 0, width, height);
    loft.addColorStop(0, '#F1F5F9');
    loft.addColorStop(0.5, '#E2E8F0');
    loft.addColorStop(1, '#CBD5E1');
    ctx.fillStyle = loft;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(width * 0.1, 0, width * 0.35, height);
    ctx.fillRect(width * 0.55, 0, width * 0.35, height);

    const softSun = ctx.createRadialGradient(width * 0.25, height * 0.2, 50, width * 0.25, height * 0.2, width * 0.7);
    softSun.addColorStop(0, 'rgba(254, 243, 199, 0.45)');
    softSun.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = softSun;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'magic_dark_moody_portrait') {
    // Charcoal Fine-Art Vignette with Warm Center
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    const moodSpot = ctx.createRadialGradient(width * 0.5, height * 0.4, 40, width * 0.5, height * 0.45, width * 0.65);
    moodSpot.addColorStop(0, 'rgba(148, 163, 184, 0.45)');
    moodSpot.addColorStop(0.5, 'rgba(51, 65, 85, 0.25)');
    moodSpot.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
    ctx.fillStyle = moodSpot;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'magic_sunlit_terrace') {
    // Mediterranean Sunlit Terrace Warm Terracotta
    const terrace = ctx.createLinearGradient(0, 0, 0, height);
    terrace.addColorStop(0, '#38BDF8');
    terrace.addColorStop(0.4, '#BAE6FD');
    terrace.addColorStop(0.75, '#FDBA74');
    terrace.addColorStop(1, '#C2410C');
    ctx.fillStyle = terrace;
    ctx.fillRect(0, 0, width, height);

    const warmLight = ctx.createRadialGradient(width * 0.3, height * 0.2, 20, width * 0.3, height * 0.2, width * 0.8);
    warmLight.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    warmLight.addColorStop(0.4, 'rgba(254, 215, 170, 0.4)');
    warmLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = warmLight;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'magic_tokyo_night') {
    // Tokyo Midnight Cityscape Reflections
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    const redNeon = ctx.createRadialGradient(width * 0.2, height * 0.3, 10, width * 0.2, height * 0.3, width * 0.5);
    redNeon.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
    redNeon.addColorStop(0.6, 'rgba(185, 28, 28, 0.15)');
    redNeon.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = redNeon;
    ctx.fillRect(0, 0, width, height);

    const blueNeon = ctx.createRadialGradient(width * 0.8, height * 0.4, 10, width * 0.8, height * 0.4, width * 0.6);
    blueNeon.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
    blueNeon.addColorStop(0.6, 'rgba(30, 58, 138, 0.15)');
    blueNeon.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = blueNeon;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 40; i++) {
      const bx = ((i * 41) % width);
      const by = ((i * 59) % (height * 0.8));
      const br = 8 + (i % 7) * 4;
      const colors = ['rgba(253, 224, 71, 0.3)', 'rgba(244, 114, 182, 0.25)', 'rgba(56, 189, 248, 0.3)'];
      ctx.fillStyle = colors[i % 3];
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (type === 'magic_aurora_borealis') {
    // Northern Lights Aurora Green & Violet Sky
    const night = ctx.createLinearGradient(0, 0, 0, height);
    night.addColorStop(0, '#050B14');
    night.addColorStop(0.5, '#0B192C');
    night.addColorStop(1, '#020617');
    ctx.fillStyle = night;
    ctx.fillRect(0, 0, width, height);

    // Green Aurora wave
    ctx.save();
    const greenWave = ctx.createLinearGradient(0, height * 0.2, width, height * 0.5);
    greenWave.addColorStop(0, 'rgba(52, 211, 153, 0.8)');
    greenWave.addColorStop(0.5, 'rgba(16, 185, 129, 0.35)');
    greenWave.addColorStop(1, 'rgba(5, 11, 20, 0)');
    ctx.fillStyle = greenWave;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.15);
    ctx.bezierCurveTo(width * 0.3, height * 0.35, width * 0.7, height * 0.1, width, height * 0.4);
    ctx.lineTo(width, height * 0.7);
    ctx.lineTo(0, height * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Purple Aurora overlay
    const purpleWave = ctx.createRadialGradient(width * 0.7, height * 0.3, 20, width * 0.7, height * 0.3, width * 0.6);
    purpleWave.addColorStop(0, 'rgba(192, 132, 252, 0.7)');
    purpleWave.addColorStop(0.6, 'rgba(147, 51, 234, 0.2)');
    purpleWave.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = purpleWave;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'magic_warm_studio_warmth') {
    // Cozy Vintage Tungsten Lighting Studio
    const warmGrad = ctx.createLinearGradient(0, 0, 0, height);
    warmGrad.addColorStop(0, '#451A03');
    warmGrad.addColorStop(0.5, '#78350F');
    warmGrad.addColorStop(1, '#1C1917');
    ctx.fillStyle = warmGrad;
    ctx.fillRect(0, 0, width, height);

    const edisonLight = ctx.createRadialGradient(width * 0.5, height * 0.3, 30, width * 0.5, height * 0.35, width * 0.6);
    edisonLight.addColorStop(0, 'rgba(253, 230, 138, 0.85)');
    edisonLight.addColorStop(0.4, 'rgba(245, 158, 11, 0.35)');
    edisonLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = edisonLight;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'magic_foggy_forest') {
    // Mystical Redwood Foggy Forest Morning
    const forest = ctx.createLinearGradient(0, 0, 0, height);
    forest.addColorStop(0, '#CBD5E1');
    forest.addColorStop(0.4, '#94A3B8');
    forest.addColorStop(0.7, '#334155');
    forest.addColorStop(1, '#0F172A');
    ctx.fillStyle = forest;
    ctx.fillRect(0, 0, width, height);

    // Fog layers
    const fog = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.7);
    fog.addColorStop(0, 'rgba(241, 245, 249, 0.6)');
    fog.addColorStop(0.5, 'rgba(226, 232, 240, 0.3)');
    fog.addColorStop(1, 'rgba(241, 245, 249, 0)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, height * 0.25, width, height * 0.5);

  } else if (type === 'magic_sunset_beach') {
    // Sunset Ocean Waves & Peach Violet Reflections
    const beach = ctx.createLinearGradient(0, 0, 0, height);
    beach.addColorStop(0, '#F43F5E');
    beach.addColorStop(0.35, '#FB923C');
    beach.addColorStop(0.65, '#818CF8');
    beach.addColorStop(1, '#1E1B4B');
    ctx.fillStyle = beach;
    ctx.fillRect(0, 0, width, height);

    const horizonGlow = ctx.createRadialGradient(width * 0.5, height * 0.45, 20, width * 0.5, height * 0.45, width * 0.7);
    horizonGlow.addColorStop(0, 'rgba(254, 243, 199, 0.9)');
    horizonGlow.addColorStop(0.4, 'rgba(251, 146, 60, 0.4)');
    horizonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'magic_scifi_clean_lab') {
    // Sleek White Architectural Futuristic Studio
    const lab = ctx.createLinearGradient(0, 0, width, height);
    lab.addColorStop(0, '#FFFFFF');
    lab.addColorStop(0.5, '#F1F5F9');
    lab.addColorStop(1, '#E2E8F0');
    ctx.fillStyle = lab;
    ctx.fillRect(0, 0, width, height);

    // Cyan accent light strips
    const strip = ctx.createRadialGradient(width * 0.5, height * 0.5, 50, width * 0.5, height * 0.5, width * 0.7);
    strip.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    strip.addColorStop(0.7, 'rgba(59, 130, 246, 0.15)');
    strip.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = strip;
    ctx.fillRect(0, 0, width, height);

  } else if (type === 'magic_autumn_warmth') {
    // Golden Autumn Maple Tree Bokeh
    const autumn = ctx.createLinearGradient(0, 0, 0, height);
    autumn.addColorStop(0, '#D97706');
    autumn.addColorStop(0.5, '#B45309');
    autumn.addColorStop(1, '#451A03');
    ctx.fillStyle = autumn;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 40; i++) {
      const ax = ((i * 47) % width);
      const ay = ((i * 61) % height);
      const ar = 12 + (i % 6) * 10;
      ctx.fillStyle = `rgba(254, 215, 170, ${0.15 + (i % 4) * 0.08})`;
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (type === 'magic_executive_boardroom') {
    // Executive Glass Boardroom with City Sunset View
    const room = ctx.createLinearGradient(0, 0, width, height);
    room.addColorStop(0, '#0F172A');
    room.addColorStop(0.5, '#1E293B');
    room.addColorStop(1, '#020617');
    ctx.fillStyle = room;
    ctx.fillRect(0, 0, width, height);

    const sunsetWindow = ctx.createLinearGradient(0, 0, width, height * 0.6);
    sunsetWindow.addColorStop(0, 'rgba(251, 146, 60, 0.6)');
    sunsetWindow.addColorStop(0.5, 'rgba(244, 63, 94, 0.3)');
    sunsetWindow.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = sunsetWindow;
    ctx.fillRect(0, 0, width, height * 0.7);

  } else if (type === 'magic_cherry_blossom') {
    // Cherry Blossom Spring Sakura Dream
    const sakura = ctx.createLinearGradient(0, 0, 0, height);
    sakura.addColorStop(0, '#FCE7F3');
    sakura.addColorStop(0.5, '#FBCFE8');
    sakura.addColorStop(1, '#F472B6');
    ctx.fillStyle = sakura;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 45; i++) {
      const px = ((i * 39) % width);
      const py = ((i * 67) % height);
      const pr = 8 + (i % 5) * 6;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + (i % 4) * 0.12})`;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

  } else {
    // Default fallback neutral studio gradient
    const defBg = ctx.createLinearGradient(0, 0, width, height);
    defBg.addColorStop(0, '#334155');
    defBg.addColorStop(1, '#0F172A');
    ctx.fillStyle = defBg;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}
