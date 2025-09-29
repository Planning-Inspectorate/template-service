import type { Session } from 'express-session';
import type { AccountInfo, AuthenticationResult } from '@azure/msal-node';

export interface AuthenticationData {
	nonce: string;
	postSigninRedirectUri: string;
}

export interface AuthState {
	account?: AccountInfo & {
		accessToken: string;
		expiresOnTimestamp?: number;
	};
	authenticationData?: AuthenticationData;
}

export type SessionWithAuth = Session & AuthState;

/**
 * @param {SessionWithAuth} session
 * @returns {void}
 */
export const destroyAuthenticationData = (session: SessionWithAuth): void => {
	delete session?.authenticationData;
};

/**
 * @param session
 * @returns
 */
export const getAuthenticationData = (session: SessionWithAuth): AuthenticationData => {
	if (session?.authenticationData) {
		return session?.authenticationData;
	}
	throw new Error('Authentication does not exist.');
};

/**
 * @param {SessionWithAuth} session
 * @param {AuthenticationData} data
 * @returns {void}
 */
export const setAuthenticationData = (session: SessionWithAuth, data: AuthenticationData): void => {
	session.authenticationData = data;
};

/**
 * @param {SessionWithAuth} session
 * @returns {void}
 */
export const destroyAccount = (session: SessionWithAuth): void => {
	delete session?.account;
};

/**
 * @param session
 * @param authenticationResult
 * @returns
 */
export const setAccount = (session: SessionWithAuth, authenticationResult: AuthenticationResult): void => {
	const { account, accessToken, idToken, expiresOn } = authenticationResult;

	if (!account) {
		return;
	}
	session.account = {
		...account,
		accessToken,
		idToken,
		expiresOnTimestamp: expiresOn?.getTime()
	};
};

/**
 * @param session
 * @returns
 */
export const getAccount = (session: SessionWithAuth): AccountInfo | undefined => {
	return session?.account;
};
