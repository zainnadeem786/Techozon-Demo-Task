const canvas = document.getElementById("designCanvas");
    let sheetWidth = 0, sheetHeight = 0;
    let zoom = 1, offsetX = 0, offsetY = 0;
    // Each fold is {x1, y1, x2, y2, direction}
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
        // Draw fold line
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", offsetX + f.x1 * zoom);
        line.setAttribute("y1", offsetY + f.y1 * zoom);
        line.setAttribute("x2", offsetX + f.x2 * zoom);
        line.setAttribute("y2", offsetY + f.y2 * zoom);
        line.setAttribute("stroke", f.direction === "up" ? "#00f" : "#f00");
        line.setAttribute("stroke-width", 2);
        line.setAttribute("class", `fold-line bend-${f.direction}`);
        line.setAttribute("data-index", i);
        canvas.appendChild(line);

        // Draw draggable endpoints
        const ep1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        ep1.setAttribute("cx", offsetX + f.x1 * zoom);
        ep1.setAttribute("cy", offsetY + f.y1 * zoom);
        ep1.setAttribute("r", 10);
        ep1.setAttribute("class", "fold-endpoint");
        ep1.setAttribute("data-index", i);
        ep1.setAttribute("data-end", "1");
        canvas.appendChild(ep1);

        const ep2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        ep2.setAttribute("cx", offsetX + f.x2 * zoom);
        ep2.setAttribute("cy", offsetY + f.y2 * zoom);
        ep2.setAttribute("r", 10);
        ep2.setAttribute("class", "fold-endpoint");
        ep2.setAttribute("data-index", i);
        ep2.setAttribute("data-end", "2");
        canvas.appendChild(ep2);
      });

      update3DPreview();
    }

    function addFoldLine() {
      if (!showSheet) return;
      const pos = parseFloat(document.getElementById("foldPos").value);
      const direction = document.getElementById("bendDirection").value;
      // Default: vertical fold, full height
      if (!isNaN(pos) && pos > 0 && pos < sheetWidth) {
        folds.push({
          x1: pos, y1: 0,
          x2: pos, y2: sheetHeight,
          direction
        });
        drawCanvas();
      }
    }

    function removeLastFoldLine() {
      folds.pop();
      drawCanvas();
    }

    // Zoom/pan
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

    // Drag endpoints
    let draggingEndpoint = null;
    canvas.addEventListener("mousedown", (e) => {
      const index = e.target.dataset.index;
      const end = e.target.dataset.end;
      if (index !== undefined && end !== undefined) {
        draggingEndpoint = { index: parseInt(index), end: end };
        isDragging = false; // prevent pan
      }
    });
    window.addEventListener("mousemove", (ev) => {
      if (draggingEndpoint) {
        const { index, end } = draggingEndpoint;
        const rect = canvas.getBoundingClientRect();
        const mx = (ev.clientX - rect.left - offsetX) / zoom;
        const my = (ev.clientY - rect.top - offsetY) / zoom;
        // Clamp to sheet
        const x = Math.max(0, Math.min(sheetWidth, mx));
        const y = Math.max(0, Math.min(sheetHeight, my));
        if (end === "1") {
          folds[index].x1 = x;
          folds[index].y1 = y;
        } else {
          folds[index].x2 = x;
          folds[index].y2 = y;
        }
        drawCanvas();
      }
    });
    window.addEventListener("mouseup", () => {
      draggingEndpoint = null;
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
        const fx1 = offsetX + f.x1 * zoom;
        const fy1 = offsetY + f.y1 * zoom;
        const fx2 = offsetX + f.x2 * zoom;
        const fy2 = offsetY + f.y2 * zoom;
        dxf += `0\nLINE\n8\nFOLDS\n10\n${fx1}\n20\n${fy1}\n11\n${fx2}\n21\n${fy2}\n`;
      });
      dxf += "0\nENDSEC\n0\nEOF";
      const blob = new Blob([dxf], { type: "application/dxf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sheet-metal-design.dxf";
      a.click();
      URL.revokeObjectURL(url);
    }

    // 3D Preview with true fold (single fold only for demo)
    let threeRenderer, threeScene, threeCamera, threeAnimId;
    function update3DPreview() {
      // Remove old renderer if any
      if (threeRenderer) {
        threeRenderer.dispose();
        document.getElementById('sheet3d').innerHTML = '';
        cancelAnimationFrame(threeAnimId);
      }
      if (!showSheet) return;

      // Setup scene
      threeScene = new THREE.Scene();
      threeCamera = new THREE.PerspectiveCamera(45, 300/200, 0.1, 1000);
      threeCamera.position.set(0, 0, 400);

      threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      threeRenderer.setSize(300, 200);
      document.getElementById('sheet3d').appendChild(threeRenderer.domElement);

      // Lighting
      threeScene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
      dirLight.position.set(0,0,1);
      threeScene.add(dirLight);

      // If there is at least one fold, bend the sheet
      if (folds.length > 0) {
        // Only use the first fold for this demo
        const f = folds[0];
        // Convert to -90..90 coordinates (centered)
        const sx = (f.x1 / sheetWidth - 0.5) * 180;
        const sy = (0.5 - f.y1 / sheetHeight) * 120;
        const ex = (f.x2 / sheetWidth - 0.5) * 180;
        const ey = (0.5 - f.y2 / sheetHeight) * 120;

        // Calculate the fold axis in 3D
        const axis = new THREE.Vector3(ex - sx, ey - sy, 0).normalize();
        const mid = new THREE.Vector3((sx+ex)/2, (sy+ey)/2, 0);

        // Create two geometries, split by the fold
        // For demo: just create two planes and rotate one
        const shape1 = new THREE.Shape();
        shape1.moveTo(-90, 60);
        shape1.lineTo(sx, sy);
        shape1.lineTo(ex, ey);
        shape1.lineTo(90, -60);
        shape1.lineTo(-90, -60);
        shape1.lineTo(-90, 60);

        const shape2 = new THREE.Shape();
        shape2.moveTo(90, -60);
        shape2.lineTo(ex, ey);
        shape2.lineTo(sx, sy);
        shape2.lineTo(-90, 60);
        shape2.lineTo(90, 60);
        shape2.lineTo(90, -60);

        const geom1 = new THREE.ShapeGeometry(shape1);
        const geom2 = new THREE.ShapeGeometry(shape2);

        const mat1 = new THREE.MeshPhongMaterial({ color: 0xc2fbd7, side: THREE.DoubleSide, shininess: 80 });
        const mat2 = new THREE.MeshPhongMaterial({ color: 0x8fd6b4, side: THREE.DoubleSide, shininess: 80 });

        const mesh1 = new THREE.Mesh(geom1, mat1);
        const mesh2 = new THREE.Mesh(geom2, mat2);

        // Rotate mesh2 90deg (up) or -90deg (down) around the fold axis
        mesh2.position.copy(mid);
        mesh2.applyMatrix4(new THREE.Matrix4().makeTranslation(-mid.x, -mid.y, 0));
        mesh2.applyMatrix4(new THREE.Matrix4().makeRotationAxis(axis, f.direction === "up" ? Math.PI/2 : -Math.PI/2));
        mesh2.applyMatrix4(new THREE.Matrix4().makeTranslation(mid.x, mid.y, 0));

        threeScene.add(mesh1);
        threeScene.add(mesh2);

        // Draw the fold line
        const foldMat = new THREE.LineBasicMaterial({ color: f.direction === "down" ? 0xff0000 : 0x0000ff, linewidth: 4 });
        const foldGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(sx, sy, 1),
          new THREE.Vector3(ex, ey, 1)
        ]);
        const foldLine = new THREE.Line(foldGeom, foldMat);
        threeScene.add(foldLine);

      } else {
        // No fold: show flat sheet
        const geometry = new THREE.PlaneGeometry(180, 120, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0xc2fbd7, side: THREE.DoubleSide, shininess: 80 });
        const mesh = new THREE.Mesh(geometry, material);
        threeScene.add(mesh);
      }

      // Animate rotation
      function animate() {
        threeScene.rotation.y += 0.01;
        threeRenderer.render(threeScene, threeCamera);
        threeAnimId = requestAnimationFrame(animate);
      }
      animate();
    }