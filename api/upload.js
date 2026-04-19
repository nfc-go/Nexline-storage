export default async function handler(req, res) {
  try {
    const b2KeyId = process.env.B2_KEY_ID;
    const b2AppKey = process.env.B2_APP_KEY;
    const bucketId = process.env.B2_BUCKET_ID;

    // 1. طلب تصريح الدخول من Backblaze
    const auth = Buffer.from(`${b2KeyId}:${b2AppKey}`).toString('base64');
    const authRes = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    const authData = await authRes.json();

    // 2. طلب رابط الرفع (Upload URL)
    const urlRes = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: { 'Authorization': authData.authorizationToken },
      body: JSON.stringify({ bucketId: bucketId })
    });
    const urlData = await urlRes.json();

    // 3. نبعت البيانات للمتصفح عشان يرفع فوراً
    res.status(200).json({
      uploadUrl: urlData.uploadUrl,
      authToken: urlData.authorizationToken
    });
  } catch (err) {
    res.status(500).json({ error: "Connection Failed" });
  }
}
