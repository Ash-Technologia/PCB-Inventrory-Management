const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Analyze Excel file structure and save to JSON
function analyzeExcelFile(filePath, outputFile) {
    console.log(`\nAnalyzing: ${path.basename(filePath)}`);

    try {
        const workbook = xlsx.readFile(filePath);
        const analysis = {
            fileName: path.basename(filePath),
            sheets: []
        };

        workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

            const sheetAnalysis = {
                name: sheetName,
                totalRows: data.length,
                totalColumns: data.length > 0 ? Math.max(...data.map(row => (row || []).length)) : 0,
                headers: data[0] || [],
                sampleData: data.slice(1, 6) // First 5 data rows
            };

            analysis.sheets.push(sheetAnalysis);
        });

        // Save to JSON file
        fs.writeFileSync(outputFile, JSON.stringify(analysis, null, 2));
        console.log(`✅ Analysis saved to: ${outputFile}`);

        return analysis;
    } catch (error) {
        console.error(`❌ Error analyzing ${filePath}:`, error.message);
        return null;
    }
}

// Analyze both files
const datasetPath = path.join(__dirname, '../../dataset');
const outputPath = path.join(__dirname, '../analysis');

// Create analysis directory if it doesn't exist
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

console.log('Starting Excel Analysis...\n');

const bajajAnalysis = analyzeExcelFile(
    path.join(datasetPath, 'Bajaj PCB Dec 25 Data.xlsm'),
    path.join(outputPath, 'bajaj_analysis.json')
);

const atombergAnalysis = analyzeExcelFile(
    path.join(datasetPath, 'Atomberg Data.xlsm'),
    path.join(outputPath, 'atomberg_analysis.json')
);

console.log('\n✅ Analysis Complete!');
console.log(`\nBajaj Sheets: ${bajajAnalysis ? bajajAnalysis.sheets.map(s => s.name).join(', ') : 'N/A'}`);
console.log(`Atomberg Sheets: ${atombergAnalysis ? atombergAnalysis.sheets.map(s => s.name).join(', ') : 'N/A'}`);
