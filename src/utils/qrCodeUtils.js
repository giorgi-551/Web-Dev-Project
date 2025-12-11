import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
// geenerate a unique ticket code and corresponding QR code image
export const generateTicketCode = () => {
  return uuidv4().substring(0, 12).toUpperCase();
};


export const generateQRcode = async (data) => {

  try 
  {
    return await QRCode.toDataURL(JSON.stringify(data));

  } catch(error)
  {
    console.error("error generating QR code:", error);

    return null;
  }
}