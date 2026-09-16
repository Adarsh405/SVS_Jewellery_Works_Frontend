const axios = require("axios");

const PHONEPE_API =
  "https://api.phonepe.com/apis/pg";


// ======================================================
// GET PHONEPE ACCESS TOKEN
// ======================================================

const getPhonePeAccessToken = async () => {
  try {
    const params = new URLSearchParams();

    params.append(
      "client_id",
      process.env.PHONEPE_CLIENT_ID
    );

    params.append(
      "client_version",
      process.env.PHONEPE_CLIENT_VERSION
    );

    params.append(
      "client_secret",
      process.env.PHONEPE_CLIENT_SECRET
    );

    params.append(
      "grant_type",
      "client_credentials"
    );

    const response = await axios.post(
      "https://api.phonepe.com/apis/identity-manager/v1/oauth/token",
      params.toString(),
      {
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;

  } catch (error) {
    console.error(
      "PhonePe token error:",
      error.response?.data || error.message
    );

    throw new Error(
      "Unable to authenticate with PhonePe"
    );
  }
};


// ======================================================
// CREATE PAYMENT
// ======================================================

const createPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const numericAmount = Number(amount);

    if (
      !numericAmount ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    // ₹100 = 10000 paise
    const amountInPaise = Math.round(
      numericAmount * 100
    );

    // Unique merchant order ID
    const merchantOrderId =
      `SVS_${Date.now()}_${Math.floor(
        Math.random() * 10000
      )}`;

    // Get PhonePe token
    const accessToken =
      await getPhonePeAccessToken();


    // PhonePe payment request
    const paymentPayload = {
      merchantOrderId,

      amount: amountInPaise,

      expireAfter: 1200,

      paymentFlow: {
        type: "PG_CHECKOUT",

        merchantUrls: {
          redirectUrl:
            `${process.env.FRONTEND_URL}/payment?orderId=${merchantOrderId}`,
        },
      },
    };


    const response = await axios.post(
      `${PHONEPE_API}/checkout/v2/pay`,

      paymentPayload,

      {
        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `O-Bearer ${accessToken}`,
        },
      }
    );


    console.log(
      "PhonePe create response:",
      response.data
    );


    return res.status(200).json({
      success: true,

      orderId: merchantOrderId,

      amount: numericAmount,

      phonePe: response.data,
    });

  } catch (error) {

    console.error(
      "Create payment error:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to create PhonePe payment",

      error:
        error.response?.data ||
        error.message,
    });
  }
};


// ======================================================
// CHECK PAYMENT STATUS
// ======================================================

const checkPaymentStatus = async (
  req,
  res
) => {

  try {

    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }


    const accessToken =
      await getPhonePeAccessToken();


    const response = await axios.get(

      `${PHONEPE_API}/checkout/v2/order/${orderId}/status`,

      {
        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `O-Bearer ${accessToken}`,
        },
      }
    );


    const data = response.data;


    console.log(
      "PhonePe status:",
      data
    );


    let status = "PENDING";


    if (data.state === "COMPLETED") {
      status = "SUCCESS";
    }

    else if (
      data.state === "FAILED" ||
      data.state === "EXPIRED"
    ) {
      status = "FAILED";
    }


    const paymentDetails =
      data.paymentDetails?.[0];


    const transactionId =
      paymentDetails?.transactionId ||
      paymentDetails?.transactionReferenceId ||
      null;


    return res.status(200).json({

      success: true,

      orderId,

      status,

      amount:
        data.amount
          ? data.amount / 100
          : null,

      transactionId,

      phonePe: data,
    });


  } catch (error) {

    console.error(
      "Payment status error:",
      error.response?.data ||
        error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Unable to check payment status",

      error:
        error.response?.data ||
        error.message,
    });
  }
};


module.exports = {
  createPayment,
  checkPaymentStatus,
};