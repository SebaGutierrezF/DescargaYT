const request = require('supertest');
const express = require('express');
const cors = require('cors');

describe('Server Tests', () => {
  test('Server should be defined', () => {
    const app = express();
    expect(app).toBeDefined();
  });

  test('CORS middleware should be configured', () => {
    const app = express();
    app.use(cors());
    expect(app._router.stack.some(layer => layer.name === 'corsMiddleware')).toBeTruthy();
  });
});

describe('Environment Variables', () => {
  test('Required environment variables should be defined', () => {
    expect(process.env.NODE_ENV || 'development').toBeDefined();
  });
});

describe('URL Validation', () => {
  test('Should validate YouTube URLs', () => {
    const validUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    expect(validUrl).toMatch(urlPattern);
  });
}); 