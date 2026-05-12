import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path, 'r') as docx_zip:
            xml_content = docx_zip.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text = []
            for paragraph in tree.findall('.//w:p', namespaces):
                para_text = []
                for run in paragraph.findall('.//w:r', namespaces):
                    t_element = run.find('w:t', namespaces)
                    if t_element is not None and t_element.text:
                        para_text.append(t_element.text)
                if para_text:
                    text.append(''.join(para_text))
            return '\n'.join(text)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    text = extract_text_from_docx('v:\\\\TTTN\\\\Bao_cao_phan_tich_thiet_ke_Spa_Booking_System.docx')
    with open('v:\\\\TTTN\\\\scratch_read_spa_docx.txt', 'w', encoding='utf-8') as f:
        f.write(text)
