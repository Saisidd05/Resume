from pdf2docx import Converter
import sys

def main():
    pdf_file = 'Resume_Template_-1.pdf'
    docx_file = 'Resume_Template_-1.docx'
    print(f"Converting {pdf_file} to {docx_file}...")
    try:
        cv = Converter(pdf_file)
        cv.convert(docx_file, start=0, end=None)
        cv.close()
        print("Conversion successful!")
    except Exception as e:
        print(f"Error during conversion: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
