// Simple Custom HTML Canvas Chart Library for No-Backend Requirement

const SimpleChart = {
  drawBarChart(canvasId, data, labels, options = {}, colors = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth;
    const height = 300;
    
    // Set actual size in memory (scaled to account for extra pixel density)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const maxVal = Math.max(...data) || 1;
    const barWidth = chartWidth / data.length - 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Colors based on theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#4b5563';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#3b82f6';
    
    // Draw Grid and Y-axis labels
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const y = padding + (chartHeight / steps) * i;
      const val = maxVal - (maxVal / steps) * i;
      
      // Grid line
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.strokeStyle = gridColor;
      ctx.stroke();
      
      // Label format
      let labelText = Math.round(val);
      if (val >= 100000) {
        labelText = (val / 100000).toFixed(1) + 'L';
      } else if (val >= 1000) {
        labelText = (val / 1000).toFixed(0) + 'k';
      }
      ctx.fillText(labelText, padding - 10, y);
    }
    
    // Draw Bars and X-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    for (let i = 0; i < data.length; i++) {
      const x = padding + i * (chartWidth / data.length) + 5;
      const barHeight = (data[i] / maxVal) * chartHeight;
      const y = height - padding - barHeight;
      
      // Draw bar
      if (colors && colors.length > 0) {
        ctx.fillStyle = colors[i % colors.length];
      } else {
        ctx.fillStyle = primaryColor;
      }
      
      // Slight rounding on top
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();
      
      // X-axis label
      ctx.fillStyle = textColor;
      // Truncate label if too long
      let label = labels[i];
      if (label.length > 10) label = label.substring(0, 8) + '..';
      ctx.fillText(label, x + barWidth / 2, height - padding + 10);
    }
  },

  drawPieChart(canvasId, data, labels, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth;
    const height = 300;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.clearRect(0, 0, width, height);
    
    const total = data.reduce((sum, val) => sum + val, 0);
    if (total === 0) return; // Prevent division by zero
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    
    let startAngle = -0.5 * Math.PI; // Start at top
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#4b5563';

    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (data[i] / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      // Draw label lines
      const midAngle = startAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(midAngle) * (radius + 20);
      const labelY = centerY + Math.sin(midAngle) * (radius + 20);
      
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = midAngle > 0.5 * Math.PI && midAngle < 1.5 * Math.PI ? 'right' : 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${labels[i]} (${Math.round(data[i]/total*100)}%)`, labelX, labelY);
      
      startAngle += sliceAngle;
    }
  }
};
