/**
 * @openapi
 * /api/members/{id}:
 *   get:
 *     summary: Get a member by id
 *     description: Returns one member by identifier.
 *     tags:
 *       - Members
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member found.
 *   put:
 *     summary: Update a member
 *     description: Updates the selected member.
 *     tags:
 *       - Members
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member updated.
 *   delete:
 *     summary: Delete a member
 *     description: Deletes the selected member.
 *     tags:
 *       - Members
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member deleted.
 */

import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ id, message: 'Member fetched' });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ id, message: 'Member updated', member: body });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ id, message: 'Member deleted' });
}
