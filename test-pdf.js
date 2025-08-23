import { extractTextWithStyling, getPDFMetadata, isValidPDF } from './src/utils/pdfUtils.js';
import { detectTables, cleanTableData } from './src/utils/tableDetection.js';
import { processTableData, analyzeTableData } from './src/utils/dataProcessing.js';
import { exportData } from './src/utils/excelUtils.js';
import fs from 'fs';
import path from 'path';

/**
 * Test PDF processing functionality
 * @param {string} filePath - Path to the PDF file
 */
async function testPDFProcessing(filePath) {
  try {
    console.log('🔍 Testing PDF Processing...');
    console.log(`📁 File: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found:', filePath);
      return;
    }

    // Read file as buffer
    const fileBuffer = fs.readFileSync(filePath);
    const file = new File([fileBuffer], path.basename(filePath), { type: 'application/pdf' });

    console.log('📊 File size:', (file.size / 1024).toFixed(2), 'KB');

    // Step 1: Validate PDF
    console.log('\n1️⃣ Validating PDF...');
    if (!isValidPDF(file)) {
      console.error('❌ Invalid PDF file');
      return;
    }
    console.log('✅ PDF is valid');

    // Step 2: Extract metadata
    console.log('\n2️⃣ Extracting metadata...');
    const metadata = await getPDFMetadata(file);
    console.log('📋 Metadata:', {
      title: metadata.title,
      pageCount: metadata.pageCount,
      fileSize: metadata.fileSize
    });

    // Step 3: Extract text with positioning
    console.log('\n3️⃣ Extracting text with positioning...');
    const textItems = await extractTextWithStyling(file);
    console.log('📝 Text items extracted:', textItems.length);

    if (textItems.length === 0) {
      console.error('❌ No text content found in PDF');
      return;
    }

    // Show sample text items
    console.log('📄 Sample text items:');
    textItems.slice(0, 5).forEach((item, index) => {
      console.log(`  ${index + 1}. "${item.text}" (x: ${item.x}, y: ${item.y})`);
    });

    // Step 4: Detect tables
    console.log('\n4️⃣ Detecting tables...');
    const settings = {
      detectionSensitivity: 'medium',
      minTableSize: 2,
      detectBorderedTables: true,
      detectUnborderedTables: true
    };

    const detectedTables = detectTables(textItems, settings);
    console.log('📊 Tables detected:', detectedTables.length);

    if (detectedTables.length === 0) {
      console.log('⚠️  No tables detected. This might be due to:');
      console.log('   - No tabular data in the PDF');
      console.log('   - Tables are images rather than text');
      console.log('   - Table structure is not recognizable');
      console.log('   - Detection sensitivity too high');
      
      // Try with different settings
      console.log('\n🔄 Trying with high sensitivity...');
      const highSensitivitySettings = { ...settings, detectionSensitivity: 'high' };
      const highSensitivityTables = detectTables(textItems, highSensitivitySettings);
      console.log('📊 Tables with high sensitivity:', highSensitivityTables.length);
      
      if (highSensitivityTables.length === 0) {
        console.log('❌ Still no tables detected. The PDF might not contain tabular data.');
        return;
      }
    }

    // Step 5: Process and clean data
    console.log('\n5️⃣ Processing and cleaning data...');
    const processedTables = processTableData(detectedTables, settings);
    console.log('🧹 Processed tables:', processedTables.length);

    // Step 6: Analyze data
    console.log('\n6️⃣ Analyzing data...');
    processedTables.forEach((table, index) => {
      const analysis = analyzeTableData(table);
      console.log(`📊 Table ${index + 1} analysis:`, {
        rows: analysis.rowCount,
        columns: analysis.columnCount,
        dataTypes: analysis.dataTypes
      });
    });

    // Step 7: Export to Excel
    console.log('\n7️⃣ Exporting to Excel...');
    const exportOptions = {
      format: 'xlsx',
      fileName: path.basename(filePath, '.pdf'),
      includeHeaders: true,
      multipleSheets: processedTables.length > 1
    };

    const result = exportData(processedTables, exportOptions);
    console.log('✅ Export completed:', result.fileName);

    console.log('\n🎉 PDF processing test completed successfully!');
    console.log('📁 Check your downloads folder for the Excel file.');

  } catch (error) {
    console.error('❌ Error during PDF processing:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.log('Usage: node test-pdf.js <path-to-pdf-file>');
  console.log('Example: node test-pdf.js "./small table stray 2025031272 copy.pdf"');
  process.exit(1);
}

// Run the test
testPDFProcessing(filePath);
