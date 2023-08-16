const muhammara = require("muhammara");
const fs = require('fs')


/**
 * Modify a PDF by replacing text in it
 */
const modifyPdf = ({
  sourceStream,
  targetStream,
  patterns,
}) => {
  const modPdfWriter = muhammara.createWriterToModify(sourceStream, targetStream, { compress: false });
  const numPages = modPdfWriter
    .createPDFCopyingContextForModifiedFile()
    .getSourceDocumentParser()
    .getPagesCount();

  for (let page = 0; page < numPages; page++) {
    const copyingContext = modPdfWriter.createPDFCopyingContextForModifiedFile();
    const objectsContext = modPdfWriter.getObjectsContext();

    const pageObject = copyingContext.getSourceDocumentParser().parsePage(page);
    const textStream = copyingContext
      .getSourceDocumentParser()
      .queryDictionaryObject(pageObject.getDictionary(), "Contents");
    const textObjectID = pageObject.getDictionary().toJSObject().Contents.getObjectID();

    let data = [];
    const readStream = copyingContext.getSourceDocumentParser().startReadingFromStream(textStream);
    while (readStream.notEnded()) {
      const readData = readStream.read(10000);
      data = data.concat(readData);
    }

    const pdfPageAsString = Buffer.from(data).toString("binary"); // key change 1

    let modifiedPdfPageAsString = pdfPageAsString;
    console.log(modifiedPdfPageAsString)
    for (const pattern of patterns) {
      modifiedPdfPageAsString = modifiedPdfPageAsString.replaceAll(pattern.searchValue, pattern.replaceValue);
    }

    // Create what will become our new text object
    objectsContext.startModifiedIndirectObject(textObjectID);

    const stream = objectsContext.startUnfilteredPDFStream();
    stream.getWriteStream().write(strToByteArray(modifiedPdfPageAsString));
    objectsContext.endPDFStream(stream);

    objectsContext.endIndirectObject();
  }

  modPdfWriter.end();
};

/**
 * Create a byte array from a string, as muhammara expects
 */
const strToByteArray = (str) => {
  const myBuffer = [];
  const buffer = Buffer.from(str, "binary"); // key change 2
  for (let i = 0; i < buffer.length; i++) {
    myBuffer.push(buffer[i]);
  }
  return myBuffer;
};

const fillPdf = async (sourceBuffer) => {
    const sourceStream = new muhammara.PDFRStreamForBuffer(sourceBuffer);
    const targetStream = new muhammara.PDFWStreamForBuffer();
  
    modifyPdf({
      sourceStream,
      targetStream,
      patterns: [{ searchValue: "name", replaceValue: "MAHMOUD ASHRAF MAHMOUD" }], // TODO use actual patterns
    });
  
    return targetStream.buffer;
  };

(async () => {
    const buff = fs.readFileSync("./s.pdf")
    const x = await fillPdf(buff)
    fs.writeFileSync("./out4.pdf", x);
})()