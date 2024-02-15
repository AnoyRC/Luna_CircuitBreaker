# Luna

![Made-With-React](https://img.shields.io/badge/MADE%20WITH-NEXT-000000.svg?colorA=222222&style=for-the-badge&logoWidth=14&logo=nextdotjs)
![Made-With-Tailwind](https://img.shields.io/badge/MADE%20WITH-TAILWIND-06B6D4.svg?colorA=222222&style=for-the-badge&logoWidth=14&logo=tailwindcss)
![Made-With-Javascript](https://img.shields.io/badge/MADE%20WITH-Javascript-ffd000.svg?colorA=222222&style=for-the-badge&logoWidth=14&logo=javascript)
![Made-With-Solidity](https://img.shields.io/badge/MADE%20WITH-SOLIDITY-000000.svg?colorA=222222&style=for-the-badge&logoWidth=14&logo=solidity)
![Made-With-Noir](https://img.shields.io/badge/MADE%20WITH-NOIR-f2c2b6.svg?colorA=222222&style=for-the-badge&logoWidth=14)
![Made-With-Scroll](https://img.shields.io/badge/MADE%20WITH-Scroll-fef8f4.svg?colorA=222222&style=for-the-badge&logoWidth=14)

> Luna is a smart contract wallet that leverages zero-knowledge proofs for authentication

This project is the implementation for _[Luna]()_ hackathon project at [Eth Global's Circuit Breaker Hackathon](https://ethglobal.com/events/circuitbreaker)

Unlike traditional wallets with a defined owner, Luna operates on the principle that ownership is established through possession of a valid zero-knowledge proof (zk-proof) generated through _passkeys_ and _email-verification_. This wallet introduces a new paradigm in digital asset management, ensuring privacy, security, and optimal performance.

> [!TIP]  
> Luna is an On-Chain Non-custodial Wallet that even your grandma can use it

## Verified Smart Contracts

- Passkey Verifier - [0xbb027482d1F79CeC2AaFA460C428C2A7AE74e970](https://sepolia.scrollscan.dev/address/0xbb027482d1F79CeC2AaFA460C428C2A7AE74e970#code)

- Recovery Verifier - [0x50F1bbb486D62921eD9cE411c6b85Ec0B73D9130](https://sepolia.scrollscan.dev/address/0x50f1bbb486d62921ed9ce411c6b85ec0b73d9130#code)

- Luna Forwarder - [0xf1E842Ef0774dBE7CaF7f0F95d1315fD834d2a4b](https://sepolia.scrollscan.dev/address/0xf1E842Ef0774dBE7CaF7f0F95d1315fD834d2a4b#code)

- Luna Factory - [0xE24509B6413319a81A7CEA91e1e739ac2A883799](https://sepolia.scrollscan.dev/address/0xE24509B6413319a81A7CEA91e1e739ac2A883799#code)

- Luna Saving Manager - [0x2aa4c97688f340C8A2bDE2016b16dEFDC259834D](https://sepolia.scrollscan.dev/address/0x2aa4c97688f340C8A2bDE2016b16dEFDC259834D#code)

## Implementations

### Passkey Circuit
![PasskeyVerifier](https://github.com/AnoyRC/Luna_CircuitBreaker/assets/38689344/bb9a5930-dfa5-484c-8583-a22d33386bb9)

### Recovery Circuit (E-mail)
![RecoveryVerifier](https://github.com/AnoyRC/Luna_CircuitBreaker/assets/38689344/3b12cf44-8913-40a3-9723-60fdf512a531)

### Luna Transaction Flow
![WalletFlow](https://github.com/AnoyRC/Luna_CircuitBreaker/assets/38689344/ccda503e-32c3-4ecc-8b97-1533e5501cc7)

### Luna Saving Manager
![SavingManager](https://github.com/AnoyRC/Luna_CircuitBreaker/assets/38689344/08a9c737-1a14-45e9-a0c7-1c0f754c11e3)


## Features

- **Zero-Knowledge Proofs (zk-proofs)**: Our wallet relies on zk-proofs for ownership validation, providing a secure and private transaction experience. By employing cutting-edge cryptographic techniques, user data remains confidential on the blockchain.

- **Passkeys and Email Verification**: Authentication is required via passkeys and email verification to generate zk-proofs, adding an extra layer of security and user authentication.

- **Client-Side Proof Calculation**: Noir allows users to generate zk-proofs locally on their devices. This decentralized approach empowers users to control and verify their proofs before interacting with the smart contract, enhancing the privacy and security of their transactions

- **Savings**: Our Smart Contract Wallet includes an innovative savings feature designed to help users effortlessly grow their savings while managing their digital assets securely. This feature adds a unique dimension to traditional wallet functionalities, promoting financial wellness and goal-oriented saving.

- **Daily NFT Minting** - The wallet mints daily NFTs for users, each containing the total amount saved in the wallet. This unique feature provides users with a tangible representation of their financial progress.

## License

This project is licensed under the [MIT License](LICENSE).

## Authors

- **Anoy Roy Chowdhury** - [AnoyRC](https://github.com/AnoyRC)
- **Gautam Raj** - [Gautam Raj](https://github.com/Gautam25Raj)

## Acknowledgments

- [**Scroll zkEVM**](https://scroll.io/) : Special thanks to the Scroll team for providing a Layer 2 Ethereum blockchain powered by zk-rollups.

- [**Aztec Labs**](https://aztec.network/) : Thanks to Aztec Labs for developing the Noir language and providing a secure and private solution for zk-proofs.
