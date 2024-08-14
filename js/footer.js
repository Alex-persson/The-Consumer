document.addEventListener('DOMContentLoaded', function() {
    const footer = document.getElementById('footer');
    
    const repetitions = 15;

    const line = document.createElement('div');
    line.className = 'brick-line';
    line.textContent = "THE CONSUMER ".repeat(repetitions);
    footer.appendChild(line);

});