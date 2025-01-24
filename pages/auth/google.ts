import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Callback = () => {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      new URLSearchParams(router.asPath.split('#')[1]).forEach((value, key) => {
        if (key === 'id_token') {
          window.localStorage.setItem('id_token', value);
          router.push('/');
        }
      });
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router]);

  return null;
};

export default Callback;
