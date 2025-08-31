import { describe, before } from "node:test";
import * as anchor from "@coral-xyz/anchor"
import { PublicKey, type Keypair } from "@solana/web3.js"
import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun"
import { BankrunProvider } from "anchor-bankrun"
import { createMint } from "spl-token-bankrun"
import { Program } from "@coral-xyz/anchor"
import IDL from "../target/idl/tokenvesting.json"
import { Tokenvesting } from "../target/types/tokenvesting"
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";

describe("Vesting Smart Contract Test", () => {

	let beneficiary: Keypair;

	let context: ProgramTestContext;

	let provider: BankrunProvider;

	let program: Program<Tokenvesting>;

	let banksClient: BanksClient;

	let employer: Keypair;

	let mint: PublicKey

	before(async () => {
		beneficiary = new anchor.web3.Keypair();

		context = await startAnchor(
			"",
			[
				{ name: "vesting", programId: new PublicKey(IDL.address) },
			],
			[
				{
					address: beneficiary.publicKey,
					info: {
						lamports: 1_000_000_000,
						data: Buffer.alloc(0),
						owner: SYSTEM_PROGRAM_ID,
						executable: false,
					}
				}
			]
		);

		provider = new BankrunProvider(context);


		anchor.setProvider(provider);

		program = new Program<Tokenvesting>(IDL as Tokenvesting, provider);

		banksClient = context.banksClient;

		employer = provider.wallet.payer;

		// @ts-ignore
		mint = await createMint(
			banksClient,
			employer,
			employer.publicKey,
			null,
			2
		)


	})
})
