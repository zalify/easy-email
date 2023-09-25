import type { PrismaClient, Prisma } from '@prisma/client';
import { omit, pick } from 'lodash';
import type { Adapter } from 'next-auth/adapters';

export function PrismaAdapter(p: PrismaClient): Adapter {
  return {
    createUser: data => p.user.create({ data: omit(data, 'loginType') }), // 改了这里
    getUser: id => p.user.findUnique({ where: { id } }),
    getUserByEmail: email => p.user.findUnique({ where: { email } }),
    async getUserByAccount(provider_providerAccountId) {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      });
      return account?.user ?? null;
    },
    updateUser: ({ id, ...data }) => p.user.update({ where: { id }, data }),
    deleteUser: id => p.user.delete({ where: { id } }),
    linkAccount: data => {
      return p.account.create({
        data: pick(data, [
          'provider',
          'type',
          'providerAccountId',
          'access_token',
          'expires_at',
          'refresh_token',
          'token_type',
          'scope',
          'userId',
        ]),
      }) as any;
    },
    unlinkAccount: provider_providerAccountId =>
      p.account.delete({ where: { provider_providerAccountId } }) as any,
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session };
    },
    createSession: data => p.session.create({ data }),
    updateSession: data =>
      p.session.update({ where: { sessionToken: data.sessionToken }, data }),
    deleteSession: sessionToken => p.session.delete({ where: { sessionToken } }),
    async createVerificationToken(data) {
      // @ts-ignore
      const { id: _, ...verificationToken } = await p.verificationToken.create({
        data,
      });
      return verificationToken;
    },
    async useVerificationToken(identifier_token) {
      try {
        // @ts-ignore
        const { id: _, ...verificationToken } = await p.verificationToken.delete({
          where: { identifier_token },
        });
        return verificationToken;
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') return null;
        throw error;
      }
    },
  };
}
