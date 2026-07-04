/**
 * leave.controller.ts
 *
 * Controller layer for the Leave module.
 * Receives Express requests, parses inputs, and delegates to the Service layer.
 */

import { Request, Response, NextFunction } from "express";
import { LeaveService } from "./leave.service";
import { LeaveMapper } from "./leave.mapper";
import { AuthenticatedRequest } from "./leave.types";
import {
  createLeaveSchema,
  updateLeaveStatusSchema,
  getLeaveSchema,
  leaveIdSchema,
} from "./leave.validation";

export class LeaveController {
  private service: LeaveService;

  constructor() {
    this.service = new LeaveService();
  }

  /**
   * POST /api/leave
   * Submit a new leave request
   */
  applyLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedBody = createLeaveSchema.parse(req.body);
      const employeeId = (req as AuthenticatedRequest).user.id;

      const record = await this.service.applyLeave(employeeId, parsedBody);

      res.status(201).json({
        success: true,
        message: "Leave request submitted successfully",
        data: LeaveMapper.toDetailDTO(record),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/leave/:id
   * Approve or reject a leave request (HR/Admin only)
   */
  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = leaveIdSchema.parse(req.params);
      const parsedBody = updateLeaveStatusSchema.parse(req.body);
      const currentUserRole = (req as AuthenticatedRequest).user.role;

      const record = await this.service.updateStatus(
        params.id,
        parsedBody,
        currentUserRole
      );

      res.status(200).json({
        success: true,
        message: `Leave request status updated to ${record.status}`,
        data: LeaveMapper.toDetailDTO(record),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/leave/:id/cancel
   * Cancel a pending leave request
   */
  cancelLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = leaveIdSchema.parse(req.params);
      const currentUserId = (req as AuthenticatedRequest).user.id;

      const record = await this.service.cancelLeave(params.id, currentUserId);

      res.status(200).json({
        success: true,
        message: "Leave request cancelled successfully",
        data: LeaveMapper.toDetailDTO(record),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/leave
   * Retrieve filtered list of leave requests
   */
  getLeaveList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = getLeaveSchema.parse(req.query);
      const currentUser = (req as AuthenticatedRequest).user;

      const result = await this.service.getLeaveList(filters, currentUser);

      res.status(200).json({
        success: true,
        message: "Leave requests retrieved successfully",
        data: {
          records: LeaveMapper.toSummaryDTOs(result.records),
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            pages: result.pages,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/leave/:id
   * Retrieve details of a single leave request
   */
  getLeaveById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const params = leaveIdSchema.parse(req.params);
      const currentUser = (req as AuthenticatedRequest).user;

      const record = await this.service.getLeaveById(params.id, currentUser);

      res.status(200).json({
        success: true,
        message: "Leave request details retrieved successfully",
        data: LeaveMapper.toDetailDTO(record),
      });
    } catch (error) {
      next(error);
    }
  };
}
