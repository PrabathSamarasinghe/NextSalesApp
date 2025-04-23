import { CircularProgress, Typography, Box } from "@mui/material";

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 2,
        animation: "fadeIn 0.4s ease-in-out",
        bgcolor: "#f9f9f9",
        zIndex: 50,
        position: "fixed", // Added to ensure z-index works properly
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

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
};

export default LoadingScreen;
