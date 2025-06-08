import express from 'express';
import { authenticateToken } from '../../../gateway/middleware/auth';
import { UserController } from '../controllers/user.controller';

const router = express.Router();
const userController = new UserController();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: 사용자 고유 ID
 *         email:
 *           type: string
 *           description: 사용자 이메일
 *         name:
 *           type: string
 *           description: 사용자 이름
 *         phone:
 *           type: string
 *           description: 사용자 전화번호
 *         role:
 *           type: string
 *           enum: [admin, workshop_manager, delivery_driver, fleet_manager, parts_manager, user]
 *           description: 사용자 역할
 *         profileImageUrl:
 *           type: string
 *           description: 프로필 이미지 URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 계정 생성 시간
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 계정 정보 마지막 수정 시간
 *       example:
 *         id: "1a2b3c4d5e"
 *         email: "user@example.com"
 *         name: "홍길동"
 *         phone: "010-1234-5678"
 *         role: "workshop_manager"
 *         profileImageUrl: "https://storage.cargoro.com/profiles/user123.jpg"
 *         createdAt: "2025-01-01T00:00:00Z"
 *         updatedAt: "2025-01-02T00:00:00Z"
 *
 *     UserInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *         - role
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, workshop_manager, delivery_driver, fleet_manager, parts_manager, user]
 *         profileImageUrl:
 *           type: string
 *
 *     UserUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         password:
 *           type: string
 *         profileImageUrl:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관리 API
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 모든 사용자 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: 역할별 사용자 필터링
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 항목 수
 *     responses:
 *       200:
 *         description: 사용자 목록 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 오류
 */
router.get('/', authenticateToken, userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 특정 사용자 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자 정보 반환 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/:id', authenticateToken, userController.getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: 새 사용자 생성
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: 사용자 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: 유효하지 않은 입력
 *       401:
 *         description: 인증 실패
 *       409:
 *         description: 이미 존재하는 이메일
 *       500:
 *         description: 서버 오류
 */
router.post('/', authenticateToken, userController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: 사용자 정보 업데이트
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 사용자 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateInput'
 *     responses:
 *       200:
 *         description: 사용자 정보 업데이트 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: 유효하지 않은 입력
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.put('/:id', authenticateToken, userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: 사용자 삭제
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 사용자 ID
 *     responses:
 *       204:
 *         description: 사용자 삭제 성공
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.delete('/:id', authenticateToken, userController.deleteUser);

export default router;
