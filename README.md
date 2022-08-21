# XRPeg2

## APIV2

* **/payment**
    
    Creates a transaction payload.
    
    ### **GET** /payment/:destination-:feed

    *params*

    **destination** (str) : Public key of the wallet
    **amount** (int) Amount to send in drops

* **/nft**
    
    Creates an NFT payload.
    
    ### **POST** /nft

    *body*

    **uri** (url): The URI of the NFT, an HTTP/HTTPS URL
    **tokenTaxon** (int): Token Taxon

