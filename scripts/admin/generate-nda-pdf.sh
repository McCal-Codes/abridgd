#!/usr/bin/env bash
# Simple script to convert the NDA markdown to PDF using pandoc (or provide manual instructions).

MD_PATH="docs/NDA/Abridgd_Beta_NDA.md"
PDF_PATH="docs/NDA/Abridgd_Beta_NDA.pdf"

if command -v pandoc >/dev/null 2>&1; then
  echo "Converting $MD_PATH -> $PDF_PATH using pandoc..."
  pandoc "$MD_PATH" -o "$PDF_PATH" --pdf-engine=xelatex || pandoc "$MD_PATH" -o "$PDF_PATH"
  echo "Saved: $PDF_PATH"
  exit 0
fi

if command -v wkhtmltopdf >/dev/null 2>&1; then
  echo "Converting via wkhtmltopdf: rendering HTML then to PDF..."
  TMP_HTML="/tmp/abridgd_nda.html"
  pandoc "$MD_PATH" -o "$TMP_HTML" || true
  wkhtmltopdf "$TMP_HTML" "$PDF_PATH"
  echo "Saved: $PDF_PATH"
  exit 0
fi

cat <<EOF
No conversion tool found (pandoc or wkhtmltopdf). To create a PDF:

1) Install pandoc and LaTeX (recommended):
   - macOS (Homebrew): brew install pandoc
   - Install a LaTeX distribution like BasicTeX / MacTeX
   Then run:
     pandoc "$MD_PATH" -o "$PDF_PATH" --pdf-engine=xelatex

2) Or export from a Markdown editor (Typora, VS Code + Markdown PDF) to export the file to PDF and save as $PDF_PATH.

After creating the PDF, place it at: $PDF_PATH
EOF

exit 1
