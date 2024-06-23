export const handler = async function (event: any) {
  let body = null;
  event.Records.forEach((record: any) => {
    const body = JSON.parse(record.body);
    console.log(`Subject: ${body.Subject}`);
    console.log(`Message: ${body.Message}`);
  });
  const response = {
    statusCode: 200,
    body: JSON.stringify(body),
  };
  return response;
};
