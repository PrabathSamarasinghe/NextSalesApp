"use client";

import { CircularProgress, Typography, Box, keyframes } from "@mui/material";
import { styled } from "@mui/system";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const AnimatedBox = styled(Box)({
  animation: `${fadeIn} 0.4s ease-in-out`,
});

export default function Loading() {
  return (
    <AnimatedBox
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 2,
        bgcolor: "#f9f9f9",
        zIndex: 50,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <CircularProgress size={60} color="primary" />
      <Typography variant="h6" color="textSecondary">
        Please wait, loading...
      </Typography>
    </AnimatedBox>
  );
}