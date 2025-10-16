
        const API_KEY = 'AIzaSyCfnSym_wpPtzWL0P3-kslY1Y14B7nD-34';
        const SPREADSHEET_ID = '1whAHBE7025tMLuxf6BO3AXb_fNHDppRrwUjaoGhrcX8';
        
        let allSheets = [];
        let lastModifiedTime = null;
        let currentSheetName = '';
        let currentSheetData = [];

        async function loadSpreadsheetData() {
            try {
                // Get spreadsheet metadata including last modified time
                const metadataResponse = await fetch(
                    `https://www.googleapis.com/drive/v3/files/${SPREADSHEET_ID}?fields=modifiedTime,name&key=${API_KEY}`
                );
                
                if (metadataResponse.ok) {
                    const metadata = await metadataResponse.json();
                    lastModifiedTime = new Date(metadata.modifiedTime).toLocaleString('id-ID');
                    
                    // Show last modified in header
                    document.getElementById('headerLastModified').style.display = 'block';
                    document.getElementById('headerLastModifiedText').textContent = 
                        `📅 Terakhir diperbarui : ${lastModifiedTime}`;
                }

                // Get spreadsheet sheets
                const response = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                allSheets = data.sheets.map(sheet => ({
                    title: sheet.properties.title,
                    sheetId: sheet.properties.sheetId,
                    rowCount: sheet.properties.gridProperties?.rowCount || 0,
                    columnCount: sheet.properties.gridProperties?.columnCount || 0
                }));

                displaySheets(allSheets);
                document.getElementById('loadingMessage').style.display = 'none';
                document.getElementById('sheetsContainer').style.display = 'grid';

            } catch (error) {
                console.error('Error loading spreadsheet:', error);
                document.getElementById('loadingMessage').style.display = 'none';
                document.getElementById('errorMessage').style.display = 'block';
                document.getElementById('errorMessage').textContent = 
                    'Gagal memuat data spreadsheet. Pastikan API key dan ID spreadsheet benar.';
            }
        }

        function displaySheets(sheets) {
            const container = document.getElementById('sheetsContainer');
            container.innerHTML = '';

            if (sheets.length === 0) {
                container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: white; padding: 40px;">Tidak ada sheet yang ditemukan</div>';
                return;
            }

            sheets.forEach(sheet => {
                const card = document.createElement('div');
                card.className = 'sheet-card';
                card.innerHTML = `
                    <div class="sheet-name">${sheet.title}</div>
                  
                    
                `;
                card.onclick = () => loadSheetData(sheet.title);
                container.appendChild(card);
            });
        }

        async function loadSheetData(sheetName) {
            try {
                document.getElementById('sheetsContainer').style.display = 'none';
                document.getElementById('sheetDetail').style.display = 'block';
                document.getElementById('sheetContent').innerHTML = '<div class="loading" style="color: #333;">Memuat data sheet...</div>';

                // Show last modified time
                if (lastModifiedTime) {
                    document.getElementById('lastModified').style.display = 'block';
                    document.getElementById('lastModified').innerHTML = `
                        <strong>Diperbarui :</strong> ${lastModifiedTime}
                    `;
                }

                // Get sheet data with formatting
                const valuesResponse = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`
                );

                // Get sheet formatting including borders
                const formattingResponse = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?ranges=${encodeURIComponent(sheetName)}&includeGridData=true&key=${API_KEY}`
                );

                if (!valuesResponse.ok) {
                    throw new Error(`HTTP error! status: ${valuesResponse.status}`);
                }

                const valuesData = await valuesResponse.json();
                let formattingData = null;
                
                if (formattingResponse.ok) {
                    formattingData = await formattingResponse.json();
                }

                currentSheetName = sheetName;
                currentSheetData = valuesData.values || [];
                displaySheetData(sheetName, currentSheetData, formattingData);

            } catch (error) {
                console.error('Error loading sheet data:', error);
                document.getElementById('sheetContent').innerHTML = 
                    '<div class="error">Gagal memuat data sheet</div>';
            }
        }

        function displaySheetData(sheetName, values, formattingData) {
            const content = document.getElementById('sheetContent');
            
            if (values.length === 0) {
                content.innerHTML = `
                    <h2>${sheetName}</h2>
                    <p>Sheet ini kosong atau tidak memiliki data.</p>
                `;
                return;
            }

            // Get border information and column widths from formatting data
            let borders = {};
            let columnWidths = {};
            if (formattingData && formattingData.sheets && formattingData.sheets[0]) {
                const sheet = formattingData.sheets[0];
                
                // Get column widths
                if (sheet.properties && sheet.properties.gridProperties && sheet.properties.gridProperties.columnMetadata) {
                    sheet.properties.gridProperties.columnMetadata.forEach((col, index) => {
                        if (col.pixelSize) {
                            columnWidths[index] = col.pixelSize;
                        }
                    });
                }
                
                // Get borders
                if (sheet.data && sheet.data[0]) {
                    const gridData = sheet.data[0];
                    if (gridData && gridData.rowData) {
                        gridData.rowData.forEach((row, rowIndex) => {
                            if (row.values) {
                                row.values.forEach((cell, colIndex) => {
                                    if (cell.effectiveFormat && cell.effectiveFormat.borders) {
                                        const cellBorders = cell.effectiveFormat.borders;
                                        borders[`${rowIndex}-${colIndex}`] = {
                                            top: cellBorders.top && cellBorders.top.style !== 'NONE',
                                            bottom: cellBorders.bottom && cellBorders.bottom.style !== 'NONE',
                                            left: cellBorders.left && cellBorders.left.style !== 'NONE',
                                            right: cellBorders.right && cellBorders.right.style !== 'NONE'
                                        };
                                    }
                                });
                            }
                        });
                    }
                }
            }

            function getCellBorderStyle(rowIndex, colIndex) {
                const cellBorder = borders[`${rowIndex}-${colIndex}`];
                if (!cellBorder) return '';
                
                let borderStyle = '';
                if (cellBorder.top) borderStyle += 'border-top: 2px solid #999999; ';
                if (cellBorder.bottom) borderStyle += 'border-bottom: 2px solid #999999; ';
                if (cellBorder.left) borderStyle += 'border-left: 2px solid #999999; ';
                if (cellBorder.right) borderStyle += 'border-right: 2px solid #999999; ';
                
                return borderStyle;
            }

            let tableHTML = `
                <h2>📋 ${sheetName}</h2>
                <div style="overflow-x: auto; touch-action: pan-x pan-y pinch-zoom;">
                    <table class="sheet-table" style="transform-origin: top left; transition: transform 0.1s ease-out; table-layout: auto; white-space: nowrap;">
            `;

            // Add header row if exists
            if (values.length > 0) {
                tableHTML += '<thead><tr>';
                const maxCols = Math.max(...values.map(row => row.length));
                
                for (let i = 0; i < maxCols; i++) {
                    const cellValue = values[0][i] || '';
                    const borderStyle = getCellBorderStyle(0, i);
                    tableHTML += `<th style="${borderStyle}">${escapeHtml(cellValue)}</th>`;
                }
                tableHTML += '</tr></thead>';
            }

            // Add data rows
            tableHTML += '<tbody>';
            for (let i = 1; i < values.length; i++) {
                tableHTML += '<tr>';
                const maxCols = Math.max(...values.map(row => row.length));
                
                for (let j = 0; j < maxCols; j++) {
                    const cellValue = values[i][j] || '';
                    const borderStyle = getCellBorderStyle(i, j);
                    tableHTML += `<td style="${borderStyle}">${escapeHtml(cellValue)}</td>`;
                }
                tableHTML += '</tr>';
            }

            tableHTML += '</tbody></table></div>';
            
            // Add zoom controls
            tableHTML += `
                <div class="zoom-controls">
                    <span>🔍 Zoom:</span>
                    <button onclick="zoomTable(0.8)">-</button>
                    <span id="zoomLevel">100%</span>
                    <button onclick="zoomTable(1.25)">+</button>
                    <button onclick="resetZoom()" style="margin-left: 10px;">Reset</button>
                    <button onclick="fitToScreen()" style="margin-left: 10px;">📐 Pas Layar</button>
                </div>
            `;
            
            content.innerHTML = tableHTML;
            
            // Initialize zoom functionality and auto-fit to screen
            initializeZoom();
            
            // Auto-fit table to screen when first loaded
            setTimeout(() => {
                fitToScreen();
            }, 200);
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function showSheetsList() {
            document.getElementById('sheetDetail').style.display = 'none';
            document.getElementById('sheetsContainer').style.display = 'grid';
        }

        // Search functionality
        document.getElementById('searchBox').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredSheets = allSheets.filter(sheet => 
                sheet.title.toLowerCase().includes(searchTerm)
            );
            displaySheets(filteredSheets);
        });

        // Export functions
        function exportToXLSX() {
            if (currentSheetData.length === 0) {
                alert('Tidak ada data untuk diekspor');
                return;
            }

            try {
                // Create workbook and worksheet
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.aoa_to_sheet(currentSheetData);
                
                // Add worksheet to workbook
                XLSX.utils.book_append_sheet(wb, ws, currentSheetName);
                
                // Generate filename with timestamp
                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                const filename = `${currentSheetName}_${timestamp}.xlsx`;
                
                // Save file
                XLSX.writeFile(wb, filename);
                
            } catch (error) {
                console.error('Error exporting XLSX:', error);
                alert('Gagal mengekspor file XLSX');
            }
        }

        function exportToPDF() {
            if (currentSheetData.length === 0) {
                alert('Tidak ada data untuk diekspor');
                return;
            }

            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
                
                // Add title
                doc.setFontSize(16);
                doc.text(currentSheetName, 14, 15);
                
                // Add last modified info
                if (lastModifiedTime) {
                    doc.setFontSize(10);
                    doc.text(`Terakhir diubah: ${lastModifiedTime}`, 14, 25);
                }
                
                // Prepare table data
                const headers = currentSheetData[0] || [];
                const rows = currentSheetData.slice(1);
                
                // Add table
                doc.autoTable({
                    head: [headers],
                    body: rows,
                    startY: 35,
                    styles: {
                        fontSize: 8,
                        cellPadding: 2,
                    },
                    headStyles: {
                        fillColor: [102, 126, 234],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: {
                        fillColor: [249, 250, 251]
                    },
                    margin: { top: 35, right: 14, bottom: 20, left: 14 },
                });
                
                // Generate filename with timestamp
                const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                const filename = `${currentSheetName}_${timestamp}.pdf`;
                
                // Save file
                doc.save(filename);
                
            } catch (error) {
                console.error('Error exporting PDF:', error);
                alert('Gagal mengekspor file PDF');
            }
        }

        // Zoom functionality
        let currentZoom = 1;
        
        function zoomTable(factor) {
            currentZoom *= factor;
            currentZoom = Math.max(0.2, Math.min(1.5, currentZoom)); // Limit zoom between 20% and 150%
            
            const table = document.querySelector('.sheet-table');
            if (table) {
                table.style.transform = `scale(${currentZoom})`;
                updateZoomDisplay();
            }
        }
        
        function resetZoom() {
            currentZoom = 1;
            const table = document.querySelector('.sheet-table');
            if (table) {
                table.style.transform = 'scale(1)';
                updateZoomDisplay();
            }
        }
        
        function fitToScreen() {
            const table = document.querySelector('.sheet-table');
            const container = document.querySelector('#sheetContent div[style*="overflow-x"]');
            
            if (!table || !container) return;
            
            // Reset zoom first
            table.style.transform = 'scale(1)';
            
            // Wait for layout to settle
            setTimeout(() => {
                const tableWidth = table.scrollWidth;
                const containerWidth = container.clientWidth;
                
                if (tableWidth > containerWidth) {
                    // Calculate zoom to fit
                    const fitZoom = (containerWidth - 40) / tableWidth; // 40px padding
                    currentZoom = Math.max(0.2, Math.min(1.5, fitZoom));
                    
                    table.style.transform = `scale(${currentZoom})`;
                    updateZoomDisplay();
                } else {
                    currentZoom = 1;
                    updateZoomDisplay();
                }
            }, 100);
        }
        
        function updateZoomDisplay() {
            const zoomDisplay = document.getElementById('zoomLevel');
            if (zoomDisplay) {
                zoomDisplay.textContent = Math.round(currentZoom * 100) + '%';
            }
        }
        
        function initializeZoom() {
            const tableContainer = document.querySelector('#sheetContent div[style*="overflow-x"]');
            if (!tableContainer) return;
            
            let initialDistance = 0;
            let initialZoom = currentZoom;
            
            // Touch events for pinch zoom
            tableContainer.addEventListener('touchstart', function(e) {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    initialDistance = Math.hypot(
                        touch1.clientX - touch2.clientX,
                        touch1.clientY - touch2.clientY
                    );
                    initialZoom = currentZoom;
                }
            });
            
            tableContainer.addEventListener('touchmove', function(e) {
                if (e.touches.length === 2) {
                    e.preventDefault();
                    const touch1 = e.touches[0];
                    const touch2 = e.touches[1];
                    const currentDistance = Math.hypot(
                        touch1.clientX - touch2.clientX,
                        touch1.clientY - touch2.clientY
                    );
                    
                    if (initialDistance > 0) {
                        const scale = currentDistance / initialDistance;
                        currentZoom = initialZoom * scale;
                        currentZoom = Math.max(0.2, Math.min(1.5, currentZoom));
                        
                        const table = document.querySelector('.sheet-table');
                        if (table) {
                            table.style.transform = `scale(${currentZoom})`;
                            updateZoomDisplay();
                        }
                    }
                }
            });
            
            // Mouse wheel zoom (Ctrl + scroll)
            tableContainer.addEventListener('wheel', function(e) {
                if (e.ctrlKey) {
                    e.preventDefault();
                    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
                    zoomTable(zoomFactor);
                }
            });
        }

        // Load data when page loads
        loadSpreadsheetData();
    