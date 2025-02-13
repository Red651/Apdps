import React, { useEffect, useState } from "react";

const LazyRender = ({ children, id, rootMargin = "100px" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Cari elemen berdasarkan ID
    const element = document.getElementById(id);
     
    if (!element) return;

    // Buat Intersection Observer untuk mengamati elemen
    const observer = new IntersectionObserver(
      ([entry]) => {
         
        if (entry.isIntersecting) {
          setIsVisible(true); // Elemen terlihat, ubah state menjadi true
          observer.disconnect(); // Hentikan observasi setelah elemen terlihat
        }
      },
      {
        rootMargin, // Jarak tambahan sebelum elemen masuk viewport
        threshold: 0.1, // 10% elemen harus terlihat
      }
    );

    // Mulai observasi elemen
    observer.observe(element);

    // Bersihkan observasi saat komponen unmount
    return () => observer.disconnect();
  }, [id, rootMargin]);

  return isVisible ? children : null; // Render children hanya jika elemen terlihat
};

export default LazyRender;
