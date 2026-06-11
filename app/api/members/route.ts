/**
 * @openapi
 * /api/members:
 *   get:
 *     summary: List members
 *     description: Returns the current member list.
 *     tags:
 *       - Members
 *     responses:
 *       200:
 *         description: A list of members.
 *   post:
 *     summary: Create a member
 *     description: Creates a new member record.
 *     tags:
 *       - Members
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               tier:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Member created successfully.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ members: [], count: 0 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json(
    {
      message: 'Member created',
      member: body,
    },
    { status: 201 }
  );
}
