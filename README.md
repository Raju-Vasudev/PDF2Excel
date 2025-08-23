# PDF2Excel Converter

A modern web application that converts PDF documents containing tabular data into Excel (.xlsx) files for data analysis.

## 🚀 Features

- **Drag & Drop Upload**: Easy PDF file upload with drag and drop functionality
- **Real-time Processing**: Live progress tracking during PDF processing
- **Smart Table Detection**: Automatically identifies and extracts tables from PDFs
- **Data Preview**: Preview extracted data before export
- **Multiple Export Formats**: Export as Excel (.xlsx), CSV, or JSON
- **Advanced Settings**: Customize table detection and data processing options
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Client-side Processing**: All processing happens locally for privacy

## 🛠️ Technology Stack

- **Frontend**: React 19.1.1 + Vite
- **Styling**: Tailwind CSS
- **File Upload**: React Dropzone
- **PDF Processing**: PDF.js (pdfjs-dist)
- **Excel Generation**: SheetJS (XLSX)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd PDF2Excel
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎯 Current Status

### ✅ Phase 1 Complete - Project Setup & UI Foundation
- [x] Dependencies installed and configured
- [x] Tailwind CSS setup with custom theme
- [x] Responsive layout with header and sidebar
- [x] File upload component with drag & drop
- [x] Processing status component with progress tracking
- [x] Data preview component with editing capabilities
- [x] Export options component with format selection
- [x] Settings panel for advanced configuration
- [x] Modern, responsive UI design

### 🔄 Upcoming Phases
- **Phase 2**: PDF Processing Engine
- **Phase 3**: Data Processing & Excel Generation
- **Phase 4**: User Experience & Features
- **Phase 5**: Advanced Features & Optimization

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx              # Application header
│   ├── FileUpload.jsx          # File upload with drag & drop
│   ├── ProcessingStatus.jsx    # Progress tracking
│   ├── DataPreview.jsx         # Data preview and editing
│   ├── ExportOptions.jsx       # Export format selection
│   └── SettingsPanel.jsx       # Advanced settings
├── hooks/                      # Custom React hooks (Phase 2)
├── utils/                      # Utility functions (Phase 2)
├── styles/
│   └── index.css              # Tailwind CSS and custom styles
├── App.jsx                     # Main application component
└── main.jsx                    # Application entry point
```

## 🎨 UI Components

### Header
- App branding with logo
- Navigation links
- Clean, professional design

### File Upload
- Drag & drop interface
- File validation (PDF only, max 10MB)
- Visual feedback for upload states
- Progress indicators

### Processing Status
- Real-time progress tracking
- Step-by-step status updates
- Success/error state handling
- Animated progress bars

### Data Preview
- Table view of extracted data
- Inline editing capabilities
- Export controls
- Pagination for large datasets

### Export Options
- Multiple format selection (XLSX, CSV, JSON)
- Configuration options
- Download management

### Settings Panel
- Table detection sensitivity
- Data processing options
- Text encoding settings
- Collapsible interface

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Features Implemented

1. **Modern UI/UX**: Clean, responsive design with Tailwind CSS
2. **Component Architecture**: Modular, reusable components
3. **State Management**: React hooks for state management
4. **Error Handling**: Comprehensive error states and user feedback
5. **Accessibility**: Keyboard navigation and screen reader support
6. **Performance**: Optimized rendering and lazy loading

## 🚧 Next Steps

The application is ready for Phase 2 implementation, which will include:

1. **PDF Processing Engine**
   - PDF.js integration for text extraction
   - Table detection algorithms
   - Data structure mapping

2. **Data Processing**
   - Text parsing and cleaning
   - Table structure identification
   - Data validation

3. **Excel Generation**
   - SheetJS integration
   - Multiple worksheet support
   - Formatting and styling

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Note**: This is Phase 1 of the implementation. The application currently shows a working UI with simulated data processing. Actual PDF processing and Excel generation will be implemented in subsequent phases.
