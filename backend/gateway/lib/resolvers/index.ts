import { parseISO } from 'date-fns';
import { GraphQLScalarType } from 'graphql';
import { authResolvers } from './auth';
import { organizationResolvers } from './organizations';
import { permissionResolvers } from './permissions';
import { userResolvers } from './users';

// GraphQL 스칼라 타입 정의
export const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO 형식의 날짜 및 시간',
  serialize(value) {
    // 날짜를 ISO 문자열로 변환
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  },
  parseValue(value) {
    // ISO 문자열을 Date 객체로 변환
    return parseISO(value as string);
  },
  parseLiteral(ast) {
    if (ast.kind === 'StringValue') {
      return parseISO(ast.value);
    }
    return null;
  },
});

export const jsonScalar = new GraphQLScalarType({
  name: 'JSONObject',
  description: 'JSON 객체',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === 'StringValue') {
      return JSON.parse(ast.value);
    }
    return null;
  },
});

// 모든 리졸버 통합
export const resolvers = {
  // 기본 시스템 정보
  hello: () => 'CarGoro API Gateway에 오신 것을 환영합니다!',
  version: () => '1.0.0',

  // 사용자 리졸버
  ...userResolvers,

  // 조직 리졸버
  ...organizationResolvers,

  // 권한 리졸버
  ...permissionResolvers,

  // 인증 리졸버
  ...authResolvers,

  // 스칼라 타입 리졸버
  DateTime: dateTimeScalar,
  JSONObject: jsonScalar,
};
