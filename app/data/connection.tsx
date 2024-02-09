// TO ENCODE THE KEY FILE
// const obj = {
//     // PASTE THE OBJECT HERE
// }

// const encoded = btoa(JSON.stringify(obj))

// console.log("Encoded: ", encoded)


export const getGCPCredentials = () => {
    const credential = JSON.parse(atob(process.env.GCP_KEY_ENCODED || ""))

    return {
        credentials: {
            client_email: credential.client_email,
            private_key: credential.private_key,
        },
        projectId: process.env.PROJECT_ID,
        scopes: [
            'https://www.googleapis.com/auth/drive.readonly'
        ] 
    }
}