import { AppProps } from 'next/app';
import { useEffect } from 'react';
import 'reflect-metadata';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Инициализация базы данных при старте приложения
    const initDB = async () => {
      try {
        const { initializeDatabase } = await import('../src/config/database');
        await initializeDatabase();
      } catch (error) {
        console.error('Ошибка инициализации БД:', error);
      }
    };

    initDB();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
