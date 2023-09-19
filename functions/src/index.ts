import * as functions from "firebase-functions";
import cors from "cors";
import express, {Express, Request, Response} from "express";
import helmet from "helmet";
import {param, validationResult, body} from "express-validator";
import {XummSdk} from "xumm-sdk";
import {convertStringToHex} from "xrpl";

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

const app: Express = express();
app.use(cors({origin: true}));
app.use(helmet());

// Transactions
app.get("/payment/:destination-:feed",
    param("destination").isString(),
    param("feed").isInt(),
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.sendStatus(400);
      }

      const sdk = new XummSdk(
          API_KEY,
          API_SECRET
      );

      const request = {
        "TransactionType": "Payment",
        "Destination": req.params.destination,
        "Amount": req.params.feed,
        "Memos": [],
      } as any;

      const payload = await sdk.payload.create(request, true);

      return res.status(200).json(payload);
    });

// NFTokenMint
app.post("/nft",
    body("uri").isURL(),
    body("tokenTaxon").isInt().toInt(),
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.sendStatus(400);
      }

      const sdk = new XummSdk(
          API_KEY,
          API_SECRET
      );

      const request = {
        "TransactionType": "NFTokenMint",
        "NFTokenTaxon": req.body.tokenTaxon,
        "URI": convertStringToHex(req.body.uri),
        "Memos": [],
      } as any;

      const payload = await sdk.payload.create(request, true);

      return res.status(200).json(payload);
    });

export const xummApi = functions
    .https.onRequest(app);
