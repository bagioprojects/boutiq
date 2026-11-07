'use client';

import React, { useState, useEffect } from 'react';
import { SeoLink } from '../primitives/SeoLink';

export interface SlideItem {
  id: string;
  tagline: string;
  title: string;
  subtitle: string;
  handwrittenNote?: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  bgColor?: string;
}

export interface HeroBannerSliderProps {
  slides?: SlideItem[];
  autoPlayIntervalMs?: number;
}

export const HeroBannerSlider: React.FC<HeroBannerSliderProps> = ({
  slides = [
    {
      id: 'slide-1',
      tagline: 'STİLİNİ YENİLE',
      title: 'İNDİRİMLİ ÜRÜNLER',
      subtitle: 'Dolabınızın favori parçaları şimdi indirimli fiyatlarıyla sizi bekliyor!',
      handwrittenNote: 'İndirimleri Sizinle Buluşturduk ♡',
      buttonText: 'ALIŞVERİŞE BAŞLA →',
      buttonUrl: '/koleksiyon/indirim',
      imageUrl: '/images/banner_slide_1_hd.jpg',
      bgColor: '#4a2818',
    },
    {
      id: 'slide-2',
      tagline: 'YENİ SEZON KOLEKSİYONU',
      title: 'FK BUTİK EXCLUSIVE',
      subtitle: 'Zarafet ve konforun buluştuğu en trend parçalar yayında!',
      handwrittenNote: 'Özel Tasarımlar Keşfet ♡',
      buttonText: 'KOLEKSİYONU İNCELE →',
      buttonUrl: '/koleksiyon/yeni-gelenler',
      imageUrl: '/images/banner_slide_1_hd.jpg',
      bgColor: '#1a1a2e',
    },
  ],
  autoPlayIntervalMs = 6000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayIntervalMs);
    return () => clearInterval(timer);
  }, [slides.length, autoPlayIntervalMs]);

  const activeSlide = slides[currentIndex] || slides[0]!;

  return (
    <section className="fk-hero-slider-wrap">
      <div className="fk-hero-slider-viewport">
        {/* Banner Arka Plan ve Manken Görseli */}
        <div
          className="fk-slide-background"
          style={{
            backgroundImage: `url('${activeSlide.imageUrl}')`,
          }}
        />

        {/* Banner İçerik Alanı */}
        <div className="fk-container fk-slide-content-container">
          <div className="fk-slide-text-block">
            {/* Üst Vurgu: STİLİNİ YENİLE */}
            <span className="fk-slide-tagline">{activeSlide.tagline}</span>

            {/* Büyük Başlık: İNDİRİMLİ ÜRÜNLER */}
            <h1 className="fk-slide-title">{activeSlide.title}</h1>

            {/* Açıklama Metni */}
            <p className="fk-slide-subtitle">{activeSlide.subtitle}</p>

            {/* Eyleme Çağrı Butonu (CTA) */}
            <div className="fk-slide-cta-wrap">
              <SeoLink href={activeSlide.buttonUrl} className="fk-slide-btn">
                {activeSlide.buttonText}
              </SeoLink>
            </div>
          </div>

          {/* El Yazısı Notu (İndirimleri Sizinle Buluşturduk) */}
          {activeSlide.handwrittenNote && (
            <div className="fk-slide-handwritten-note">
              <span>{activeSlide.handwrittenNote}</span>
            </div>
          )}
        </div>

        {/* Ok Navigasyonları */}
        <button
          type="button"
          className="fk-slider-nav fk-slider-prev"
          onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
          aria-label="Önceki Slayt"
        >
          ‹
        </button>
        <button
          type="button"
          className="fk-slider-nav fk-slider-next"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
          aria-label="Sonraki Slayt"
        >
          ›
        </button>

        {/* Alt Noktalar (Dots) */}
        <div className="fk-slider-dots">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              className={`fk-slider-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Slayt ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

