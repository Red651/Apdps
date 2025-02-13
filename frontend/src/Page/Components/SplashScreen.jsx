import { useEffect, useState } from "react";
import { Box, Text, Image, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import BackgroundSplash from "../../assets/background-splash.jpg";
import Logos from "../../assets/logos.jpeg";

const MotionFlex = motion(Flex);

const SplashScreen = ({ onAnimationComplete }) => {
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  useEffect(() => {
    // Timer untuk menyembunyikan splash screen setelah 3 detik
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
      if (onAnimationComplete) {
        onAnimationComplete(); // Panggil fungsi setelah animasi selesai
      }
    }, 3000); // Durasi splash screen tampil (3 detik)

    // Bersihkan timer saat komponen di-unmount
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  // Jangan render splash screen jika sudah tidak perlu ditampilkan
  if (!showSplashScreen) {
    return null;
  }

  return (
    <MotionFlex
      className={"rijal"}
      direction="column"
      align="left"
      justify="center"
      bgImage={BackgroundSplash}
      bgPosition="center"
      bgSize="cover"
      height="100vh"
      width="100vw"
      position="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: "-100vh" }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <Box
        position="absolute"
        display="flex"
        top="20px"
        left="0px"
        backgroundColor="white"
        rounded="2xl"
      >
        <Box width="10px" backgroundColor="red"></Box>
        <Image src={Logos} alt="Logo" width="200px" />
        <Box width="40px" backgroundColor="white" borderRadius="3xl"></Box>
      </Box>

      <Box textAlign="left" color="white" ml="50px" fontFamily={"Mulish"}>
        <Text fontSize="80" fontWeight="bold">
          Selamat Datang di ApDPS
        </Text>
        <Text fontSize="40">
          Aplikasi Data Teknik dan Manajemen Kerja Pengeboran dan Sumuran
        </Text>
      </Box>
    </MotionFlex>
  );
};

export default SplashScreen;
