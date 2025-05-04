const canvas = document.getElementById("designCanvas");
    let sheetWidth = 0, sheetHeight = 0;
    let zoom = 1, offsetX = 0, offsetY = 0;
    let folds = [];
    let showSheet = false;

    function setSheet() {
      sheetWidth = parseFloat(document.getElementById("sheetWidth").value);
      sheetHeight = parseFloat(document.getElementById("sheetHeight").value);
      
      if (!sheetWidth || !sheetHeight || sheetWidth <= 0 || sheetHeight <= 0) {
        showError("⚠️ Please enter valid width and height values to create your sheet.");
        return;
      }

      showSheet = true;
      offsetX = (1000 - sheetWidth) / 2;
      offsetY = 10;
      hideError();
      drawCanvas();
    }

    function clearCanvas() {
      folds = [];
      showSheet = false;
      zoom = 1;
      offsetX = 0;
      offsetY = 0;
      drawCanvas();
    }

    function drawCanvas() {
      canvas.innerHTML = '';

      if (showSheet) {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", offsetX);
        rect.setAttribute("y", offsetY);
        rect.setAttribute("width", sheetWidth * zoom);
        rect.setAttribute("height", sheetHeight * zoom);
        rect.setAttribute("fill", "#c2fbd7");
        rect.setAttribute("stroke", "#333");
        canvas.appendChild(rect);
      }

      folds.forEach((f, i) => {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", offsetX + f.pos * zoom);
        line.setAttribute("y1", offsetY);
        line.setAttribute("x2", offsetX + f.pos * zoom);
        line.setAttribute("y2", offsetY + sheetHeight * zoom);
        line.setAttribute("stroke", f.direction === "up" ? "#00f" : "#f00");
        line.setAttribute("stroke-width", 2);
        line.setAttribute("class", `fold-line bend-${f.direction}`);
        line.setAttribute("data-index", i);
        canvas.appendChild(line);
      });
    }

    function addFoldLine() {
      if (!showSheet) return;
      const pos = parseFloat(document.getElementById("foldPos").value);
      const direction = document.getElementById("bendDirection").value;
      if (!isNaN(pos) && pos > 0 && pos < sheetWidth) {
        folds.push({ pos, direction });
        drawCanvas();
      }
    }

    function removeLastFoldLine() {
      folds.pop();
      drawCanvas();
    }

    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      zoom = Math.min(3, Math.max(0.2, zoom + delta));
      drawCanvas();
    });

    let isDragging = false, dragStart = null;
    canvas.addEventListener("mousedown", (e) => {
      dragStart = { x: e.offsetX, y: e.offsetY };
      isDragging = true;
    });
    canvas.addEventListener("mouseup", () => isDragging = false);
    canvas.addEventListener("mousemove", (e) => {
      if (isDragging) {
        offsetX += (e.offsetX - dragStart.x);
        offsetY += (e.offsetY - dragStart.y);
        dragStart = { x: e.offsetX, y: e.offsetY };
        drawCanvas();
      }
    });

    canvas.addEventListener("mousedown", (e) => {
      const index = e.target.dataset.index;
      if (index !== undefined) {
        const move = (ev) => {
          const pos = (ev.offsetX - offsetX) / zoom;
          folds[index].pos = Math.max(0, Math.min(sheetWidth, pos));
          drawCanvas();
        };
        const up = () => {
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", up);
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      }
    });

    function showError(message) {
      const errorMsg = document.getElementById('error-msg');
      errorMsg.innerText = message;
      errorMsg.style.display = 'block';
    }

    function hideError() {
      const errorMsg = document.getElementById('error-msg');
      errorMsg.style.display = 'none';
    }

    function checkValidSheet() {
      if (!showSheet || sheetWidth <= 0 || sheetHeight <= 0) {
        showError("⚠️ Please create a valid sheet before downloading the design.");
        return false;
      }
      hideError();
      return true;
    }

    function downloadSVG() {
      if (!checkValidSheet()) return;
      const blob = new Blob([canvas.outerHTML], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sheet-metal-design.svg";
      a.click();
      URL.revokeObjectURL(url);
      logDownload("SVG");
    }

    function downloadPNG() {
      if (!checkValidSheet()) return;
      const svgData = new XMLSerializer().serializeToString(canvas);
      const canvasElement = document.createElement('canvas');
      const ctx = canvasElement.getContext('2d');
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      img.onload = function() {
        canvasElement.width = img.width;
        canvasElement.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imgURL = canvasElement.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = imgURL;
        a.download = 'sheet-metal-design.png';
        a.click();
      };
      logDownload("PNG");
    }

    function downloadDXF() {
      if (!checkValidSheet()) return;
      let dxf = "0\nSECTION\n2\nENTITIES\n";

      // Rectangle as four lines
      const x1 = offsetX, y1 = offsetY;
      const x2 = offsetX + sheetWidth * zoom, y2 = offsetY + sheetHeight * zoom;
      dxf += `0\nLINE\n8\n0\n10\n${x1}\n20\n${y1}\n11\n${x2}\n21\n${y1}\n`;
      dxf += `0\nLINE\n8\n0\n10\n${x2}\n20\n${y1}\n11\n${x2}\n21\n${y2}\n`;
      dxf += `0\nLINE\n8\n0\n10\n${x2}\n20\n${y2}\n11\n${x1}\n21\n${y2}\n`;
      dxf += `0\nLINE\n8\n0\n10\n${x1}\n20\n${y2}\n11\n${x1}\n21\n${y1}\n`;

      // Fold lines
      folds.forEach(f => {
        const x = offsetX + f.pos * zoom;
        dxf += `0\nLINE\n8\nFOLDS\n10\n${x}\n20\n${y1}\n11\n${x}\n21\n${y2}\n`;
      });

      dxf += "0\nENDSEC\n0\nEOF";
      const blob = new Blob([dxf], { type: "application/dxf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sheet-metal-design.dxf";
      a.click();
      URL.revokeObjectURL(url);
      logDownload("DXF");
    }


    