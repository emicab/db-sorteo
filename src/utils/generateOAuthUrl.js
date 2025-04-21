export const generateOAuthUrl = (clientId, redirectUri, state) => {
  const base = "https://auth.mercadopago.com.ar/authorization";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state, // puede ser el userId o algo que identifique al host
  });

  return `${base}?${params.toString()}`;
};
