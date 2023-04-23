import cookie from "cookie";
import CryptoJS from "crypto-js";
import QueryString from "./query-string";

export default async function Requests(req, res) {
  let body = JSON.parse(req.body);
  const cookies = cookie.parse(req.headers.cookie || "");
  try {
    const mid_password = CryptoJS.AES.decrypt(
      cookies.login_token,
      process.env.SECRET
    );
    const password = mid_password.toString(CryptoJS.enc.Utf8);
    const data = await fetch(process.env.GRAPHQL_URI, {
      method: "POST",
      headers: {
        email: body.email,
        password: password,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
  mutation{
    updateOneRegisteration(query:${QueryString({
      email: body.second_email,
    })}, set:${QueryString({
          verified: body.verified,
          error: body.error,
        })}) {
      files
      email
    }
  }
  `,
      }),
    }).then((e) => e.json());
    res.json({
      error: false,
      data: data.data.registeration,
    });
  } catch {
    res.json({ error: true, message: "Some Error Occured" });
  }
}
