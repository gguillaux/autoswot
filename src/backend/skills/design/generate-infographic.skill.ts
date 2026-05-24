import { z } from 'zod';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { Skill, SkillError } from '../skill.interface.js';
import { SecurityAnalysis } from '../../agents/types/analysis.types.js';
import { DesignStyle } from '../../agents/types/pipeline.types.js';
import { DesignOutput, DesignOutputSchema, StyleConfig } from '../../agents/types/design.types.js';
import { applyStyleSkill } from './apply-style.skill.js';
import { v4 as uuidv4 } from 'uuid';

const InputSchema = z.object({
  analysis: z.any(), // SecurityAnalysis
  style: z.enum(['dark_gradient', 'clean_corporate', 'bold_editorial']),
  layoutHints: z.any().optional(),
});

type Input = {
  analysis: SecurityAnalysis;
  style: DesignStyle;
  layoutHints?: any;
};

// Ensure fonts directory exists and register
try {
  const fontDir = path.resolve(process.cwd(), 'assets', 'fonts');
  if (fs.existsSync(fontDir)) {
    GlobalFonts.registerFromPath(path.join(fontDir, 'Inter-Regular.ttf'), 'Inter');
    GlobalFonts.registerFromPath(path.join(fontDir, 'Inter-Medium.ttf'), 'Inter');
    GlobalFonts.registerFromPath(path.join(fontDir, 'Inter-Bold.ttf'), 'Inter');
    GlobalFonts.registerFromPath(path.join(fontDir, 'Inter-Black.ttf'), 'Inter');
  }
} catch (e) {
  console.warn('Could not load fonts, falling back to system fonts', e);
}

export const generateInfographicSkill: Skill<Input, DesignOutput> = {
  name: 'generate_infographic',
  description: 'Renders the 1080x1920 infographic using node-canvas',
  inputSchema: InputSchema as any,
  outputSchema: DesignOutputSchema,

  async execute(input: Input): Promise<DesignOutput> {
    const { analysis, style } = input;
    const styleConfig = await applyStyleSkill.execute({ style });

    const width = 1080;
    const height = 1920;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 1. Background
    drawBackground(ctx, width, height, styleConfig);

    const pad = styleConfig.spacing.padding;
    let yPos = pad;

    // 2. Header (Company, Ticker, Sector)
    yPos = drawHeader(ctx, analysis, styleConfig, pad, yPos, width - pad * 2);
    yPos += styleConfig.spacing.sectionGap;

    // 3. Overview Card
    yPos = drawOverviewCard(ctx, analysis.overview, styleConfig, pad, yPos, width - pad * 2);
    yPos += styleConfig.spacing.sectionGap;

    // 4. SWOT Grid
    yPos = drawSwotGrid(ctx, analysis.swot, styleConfig, pad, yPos, width - pad * 2);
    yPos += styleConfig.spacing.sectionGap;

    // 5. History Timeline
    yPos = drawTimeline(ctx, analysis.history, styleConfig, pad, yPos, width - pad * 2);
    
    // 6. Footer
    drawFooter(ctx, width, height, pad, styleConfig);

    // Save Output
    const outDir = path.resolve(process.cwd(), 'output');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const id = uuidv4().slice(0, 8);
    const baseFilename = `${analysis.ticker.toLowerCase()}_${style}_${id}`;
    
    const jpegPath = path.join(outDir, `${baseFilename}.jpg`);
    const pngPath = path.join(outDir, `${baseFilename}.png`);

    // For @napi-rs/canvas, encode returns a Promise<Buffer>
    const jpegBuffer = await canvas.encode('jpeg', 90);
    fs.writeFileSync(jpegPath, jpegBuffer);

    const pngBuffer = await canvas.encode('png');
    fs.writeFileSync(pngPath, pngBuffer);

    return {
      jpegPath,
      pngPath,
      style,
      renderedAt: new Date().toISOString(),
    };
  },
};

function drawBackground(ctx: any, w: number, h: number, style: StyleConfig) {
  if (style.background.type === 'gradient') {
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, style.background.colors[0]);
    grd.addColorStop(1, style.background.colors[1] || style.background.colors[0]);
    ctx.fillStyle = grd;
  } else {
    ctx.fillStyle = style.background.colors[0];
  }
  ctx.fillRect(0, 0, w, h);
}

function drawHeader(ctx: any, analysis: SecurityAnalysis, style: StyleConfig, x: number, y: number, w: number): number {
  if (style.background.type === 'gradient' && style.typography.heading.color === '#000000') {
    // Bold editorial might need specific handling, keeping simple for now
  }
  
  ctx.fillStyle = style.typography.heading.color;
  ctx.font = `${style.typography.heading.weight} ${style.typography.heading.size}px ${style.typography.heading.font}`;
  ctx.textBaseline = 'top';
  ctx.fillText(analysis.companyName.substring(0, 30), x, y);

  const tX = x;
  const tY = y + style.typography.heading.size + 10;
  
  // Ticker Badge
  ctx.fillStyle = style.chartColors[0] || '#333';
  ctx.fillRect(tX, tY, 120, 40);
  ctx.fillStyle = '#fff';
  ctx.font = `700 20px ${style.typography.body.font}`;
  ctx.fillText(analysis.ticker, tX + 15, tY + 8);

  // Sector
  ctx.fillStyle = style.typography.label.color;
  ctx.font = `500 24px ${style.typography.label.font}`;
  ctx.fillText(analysis.sector, tX + 140, tY + 8);

  return tY + 60;
}

function drawOverviewCard(ctx: any, text: string, style: StyleConfig, x: number, y: number, w: number): number {
  const cardH = 150;
  drawCardBg(ctx, x, y, w, cardH, style);
  
  ctx.fillStyle = style.typography.body.color;
  ctx.font = `${style.typography.body.weight} ${style.typography.body.size}px ${style.typography.body.font}`;
  wrapText(ctx, text, x + 30, y + 30, w - 60, style.typography.body.size * 1.5);

  return y + cardH;
}

function drawSwotGrid(ctx: any, swot: any, style: StyleConfig, x: number, y: number, w: number): number {
  const gap = 20;
  const cardW = (w - gap) / 2;
  const cardH = 350;

  const quads = [
    { title: 'STRENGTHS', data: swot.strengths, x: x, y: y, color: style.swotColors.S },
    { title: 'WEAKNESSES', data: swot.weaknesses, x: x + cardW + gap, y: y, color: style.swotColors.W },
    { title: 'OPPORTUNITIES', data: swot.opportunities, x: x, y: y + cardH + gap, color: style.swotColors.O },
    { title: 'THREATS', data: swot.threats, x: x + cardW + gap, y: y + cardH + gap, color: style.swotColors.T },
  ];

  for (const q of quads) {
    drawCardBg(ctx, q.x, q.y, cardW, cardH, style);
    
    // Title
    ctx.fillStyle = q.color;
    ctx.font = `800 24px ${style.typography.heading.font}`;
    ctx.fillText(q.title, q.x + 25, q.y + 25);

    // Items
    ctx.fillStyle = style.typography.body.color;
    ctx.font = `400 20px ${style.typography.body.font}`;
    let itemY = q.y + 70;
    for (let i = 0; i < Math.min(3, q.data.length); i++) {
      ctx.fillText('•', q.x + 25, itemY);
      const lines = wrapText(ctx, q.data[i], q.x + 45, itemY, cardW - 70, 26);
      itemY += lines * 26 + 10;
    }
  }

  return y + (cardH * 2) + gap;
}

function drawTimeline(ctx: any, history: any[], style: StyleConfig, x: number, y: number, w: number): number {
  const cardH = 220;
  drawCardBg(ctx, x, y, w, cardH, style);

  ctx.fillStyle = style.typography.heading.color;
  ctx.font = `700 24px ${style.typography.heading.font}`;
  ctx.fillText("KEY MILESTONES", x + 30, y + 25);

  const items = history.slice(0, 4); // Show max 4
  const stepW = (w - 60) / Math.max(1, items.length - 1);

  // Draw line
  ctx.beginPath();
  ctx.strokeStyle = style.cardStyle.stroke;
  ctx.lineWidth = 4;
  ctx.moveTo(x + 30, y + 100);
  ctx.lineTo(x + w - 30, y + 100);
  ctx.stroke();

  items.forEach((item, i) => {
    const px = x + 30 + (i * stepW);
    
    // Dot
    ctx.beginPath();
    ctx.fillStyle = style.chartColors[0];
    ctx.arc(px, y + 100, 10, 0, Math.PI * 2);
    ctx.fill();

    // Year
    ctx.fillStyle = style.typography.label.color;
    ctx.font = `700 20px ${style.typography.label.font}`;
    ctx.fillText(item.year.toString(), px - 20, y + 60);

    // Event
    ctx.fillStyle = style.typography.body.color;
    ctx.font = `400 16px ${style.typography.body.font}`;
    wrapText(ctx, item.event.substring(0, 60) + '...', px - 40, y + 130, 100, 20);
  });

  return y + cardH;
}

function drawFooter(ctx: any, w: number, h: number, pad: number, style: StyleConfig) {
  ctx.fillStyle = style.typography.label.color;
  ctx.font = `400 18px ${style.typography.label.font}`;
  const date = new Date().toISOString().split('T')[0];
  ctx.fillText(`Generated by AutoSWOT | ${date}`, pad, h - pad - 20);
}

function drawCardBg(ctx: any, x: number, y: number, w: number, h: number, style: StyleConfig) {
  ctx.fillStyle = style.cardStyle.fill;
  ctx.strokeStyle = style.cardStyle.stroke;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, style.cardStyle.radius);
  ctx.fill();
  ctx.stroke();
}

function wrapText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(' ');
  let line = '';
  let lines = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
      lines++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
  lines++;
  return lines;
}
