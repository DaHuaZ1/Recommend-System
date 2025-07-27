// PdfViewer.jsx
import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BackToTop from "./backToTop";

// PdfViewer.jsx
export default function PdfViewer() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const pdfData = state?.pdfData;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!pdfData) return <div>Didn't find PDF</div>;

  return (
    <Box sx={{ height:"100vh", display:"flex", flexDirection:"column" }}>
      <Box sx={{ p:1 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <Box sx={{ flexGrow:1, borderTop:"1px solid #ddd" }}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer fileUrl={pdfData} />
        </Worker>
      </Box>
      <BackToTop scrollContainerRef={scrollContainerRef} />
    </Box>
  );
}
