import { Request, Response, NextFunction } from "express";
import { AttendanceService } from "./attendance.service";
import { AttendanceMapper } from "./attendance.mapper";
import {
  checkInSchema,
  checkOutSchema,
  getAttendanceSchema,
  attendanceIdSchema,
} from "./attendance.validation";

export class AttendanceController {
  private service: AttendanceService;

  constructor() {
    this.service = new AttendanceService();
  }

  /**
   * POST /api/attendance/check-in
   */
  checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validate request body
      const parsedBody = checkInSchema.parse(req.body);

      // 2. Extract user info from req.user (populated by auth middleware)
      const employeeId = (req as any).user.id;
      const userAgent = req.headers["user-agent"];

      // 3. Invoke service
      const record = await this.service.checkIn(
        employeeId,
        userAgent,
        parsedBody.location
      );

      // 4. Return success response
      res.status(201).json({
        success: true,
        message: "Check-in successful",
        data: AttendanceMapper.toDetailResponseDTO(record),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/attendance/check-out
   */
  checkOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validate request body
      const parsedBody = checkOutSchema.parse(req.body);

      // 2. Extract user info
      const employeeId = (req as any).user.id;

      // 3. Invoke service
      const record = await this.service.checkOut(employeeId, parsedBody.location);

      // 4. Return success response
      res.status(200).json({
        success: true,
        message: "Check-out successful",
        data: AttendanceMapper.toDetailResponseDTO(record),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/attendance
   */
  getAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validate query filters
      const filters = getAttendanceSchema.parse(req.query);

      // 2. Extract current user
      const currentUser = (req as any).user;

      // 3. Invoke service
      const result = await this.service.getAttendanceList(filters, currentUser);

      // 4. Return response
      res.status(200).json({
        success: true,
        message: "Attendance records retrieved successfully",
        data: {
          records: AttendanceMapper.toResponseDTOs(result.records),
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
   * GET /api/attendance/:id
   */
  getAttendanceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validate path parameters
      const params = attendanceIdSchema.parse(req.params);

      // 2. Extract current user
      const currentUser = (req as any).user;

      // 3. Invoke service
      const record = await this.service.getAttendanceById(params.id, currentUser);

      // 4. Return response
      res.status(200).json({
        success: true,
        message: "Attendance record retrieved successfully",
        data: AttendanceMapper.toDetailResponseDTO(record),
      });
    } catch (error) {
      next(error);
    }
  };
}
