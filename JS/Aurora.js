
        // Animación Aurora en Canvas puro
        const canvas = document.getElementById('aurora-canvas');
        const ctx = canvas.getContext('2d');
        
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
        
        // Colores del Aurora
        const colors = [
            { r: 58, g: 41, b: 255 },   // #3A29FF
            { r: 255, g: 148, b: 180 },  // #FF94B4
            { r: 255, g: 50, b: 50 }     // #FF3232
        ];
        
        let time = 0;
        
        function drawAurora() {
            ctx.clearRect(0, 0, width, height);
            
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            
            // Crear gradiente animado
            const offset1 = (Math.sin(time * 0.001) + 1) / 2;
            const offset2 = (Math.cos(time * 0.0015) + 1) / 2;
            
            gradient.addColorStop(0, `rgba(${colors[0].r}, ${colors[0].g}, ${colors[0].b}, ${0.3 + offset1 * 0.2})`);
            gradient.addColorStop(0.5, `rgba(${colors[1].r}, ${colors[1].g}, ${colors[1].b}, ${0.4 + offset2 * 0.3})`);
            gradient.addColorStop(1, `rgba(${colors[2].r}, ${colors[2].g}, ${colors[2].b}, ${0.3 + offset1 * 0.2})`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            // Agregar ondas
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                for (let x = 0; x < width; x += 5) {
                    const y = height * 0.5 + 
                             Math.sin((x + time * (0.5 + i * 0.2)) * 0.01) * 100 * (i + 1) +
                             Math.cos((x + time * (0.3 + i * 0.1)) * 0.008) * 50 * (i + 1);
                    
                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();
                
                const waveColor = colors[i % colors.length];
                ctx.fillStyle = `rgba(${waveColor.r}, ${waveColor.g}, ${waveColor.b}, ${0.1})`;
                ctx.fill();
            }
            ctx.globalCompositeOperation = 'source-over';
            
            time++;
            requestAnimationFrame(drawAurora);
        }
        
        drawAurora();

