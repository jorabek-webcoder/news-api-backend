const { StatusCodes } = require("http-status-codes");
const { HttpException } = require("../../utils/http-exception");
const { REG_KEY, JWT_SECRET_KEY } = require("../../utils/secret");
const { hash, genSalt, compare } = require("bcryptjs");
const { AuthModel } = require("../../models/auth/auth.model");
const { RoleConstands } = require("../../utils/constands");
const { sign } = require("jsonwebtoken");
const { UploadModel } = require("../../models/upload/upload.model");
const { asyncHandler } = require("../../utils/async-handler");

class AuthController {
  static signUpAdmin = asyncHandler(async (req, res) => {
    const { reg_key, name, email, password } = req.body;

    if (reg_key !== REG_KEY) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "Invalid registration key",
      );
    }

    const ExistingEmail = await AuthModel.findOne({ email });

    if (ExistingEmail) {
      throw new HttpException(StatusCodes.CONFLICT, "Email already exists");
    }

    const salt = await genSalt(10);
    const hashPassword = await hash(password, salt);

    await AuthModel.create({
      name,
      email,
      password: hashPassword,
      role: RoleConstands.ADMIN,
    });

    res
      .status(StatusCodes.CREATED)
      .json({ success: true, message: "Admin registered successfully" });
  });

  static signUp = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const ExistingEmail = await AuthModel.findOne({ email });

    if (ExistingEmail) {
      throw new HttpException(StatusCodes.CONFLICT, "Email already exists");
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    await AuthModel.create({
      name,
      email,
      password: hashedPassword,
    });

    res
      .status(StatusCodes.CREATED)
      .json({ success: true, message: "User registered successfully" });
  });

  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await AuthModel.findOne({ email });

    if (!user) {
      throw new HttpException(
        StatusCodes.UNAUTHORIZED,
        "Invalid email or password",
      );
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new HttpException(
        StatusCodes.UNAUTHORIZED,
        "Invalid email or password",
      );
    }

    const token = sign({ user_id: user._id }, JWT_SECRET_KEY, {
      expiresIn: "24h",
    });

    res.status(StatusCodes.OK).json({
      success: true,
      token,
    });
  });

  static me = asyncHandler(async (req, res) => {
    const user = await AuthModel.findById(req.user.user_id).select("-password");

    res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    });
  });

  static getSingleUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.user;
    const { page = 1, limit = 5 } = req.query;

    const requestingUser = await AuthModel.findById(user_id);

    let user;
    const populateOptions = {
      path: "news",
      limit: Number(limit),
      skip: (page - 1) * limit,
    };

    if (requestingUser.role === RoleConstands.ADMIN) {
      user = await AuthModel.findById(id)
        .select("-password")
        .populate(populateOptions);
    } else {
      user = await AuthModel.findById(id)
        .select("name email profile_image news")
        .populate(populateOptions);
    }

    if (!user) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found");
    }

    user.pagination = {
      page: Number(page),
      limit: Number(limit),
      prev: page > 1 ? true : false,
      next: user.news.length === Number(limit) ? true : false,
    };

    res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    });
  });

  static getAllUsers = asyncHandler(async (req, res) => {
    const { 
      search, 
      page = 1, 
      limit = 10, 
      role,
      sortBy = "createdAt",  // Qaysi maydon bo'yicha saralash
      sortOrder = "desc"      // asc yoki desc
    } = req.query;
    const { user_id } = req.user;

    const requestingUser = await AuthModel.findById(user_id);

    if (requestingUser.role !== RoleConstands.ADMIN) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not authorized to access this resource",
      );
    }

    // Query builder
    const query = {};

    // 1. Qidiruv filtri (name yoki email bo'yicha)
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // 2. Aniq filterlar (role, status, gender, etc.)
    // Har bir filter alohida qo'shiladi
    if (role) {
      query.role = role;
    }

    // Agar keyinchalik gender, status qo'shsangiz:
    // if (gender) query.gender = gender;
    // if (status) query.status = status;

    // Saralash
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const users = await AuthModel.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-password");

    const total = await AuthModel.countDocuments(query);

    res.status(StatusCodes.OK).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  });

  static updateMeProfileImg = asyncHandler(async (req, res) => {
    const { user_id } = req.user;
    const { newProfileImg } = req.body;

    const uploadItem = await UploadModel.findOne({ file_path: newProfileImg });

    if (!uploadItem) {
      throw new HttpException(StatusCodes.NOT_FOUND, "Profile image not found");
    }

    if (uploadItem.file_type !== "image") {
      throw new HttpException(StatusCodes.BAD_REQUEST, "File is not an image");
    }

    const user = await AuthModel.findById(user_id);

    if (user._id.toString() !== uploadItem.user.toString()) {
      throw new HttpException(
        StatusCodes.FORBIDDEN,
        "You are not authorized to use this image",
      );
    }

    user.profile_image = newProfileImg;
    await user.save();

    uploadItem.is_used = true;
    await uploadItem.save();

    await UploadModel.updateOne(
      {
        file_path: user.profile_image,
      },
      { is_used: false },
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Profile image updated successfully",
    });
  });

  static updateMeEmail = asyncHandler(async (req, res) => {
    const { user_id } = req.user;
    const { newEmail } = req.body;

    const existingEmail = await AuthModel.findOne({ email: newEmail });

    if (existingEmail) {
      throw new HttpException(StatusCodes.CONFLICT, "Email already exists");
    }

    const user = await AuthModel.findById(user_id);

    if (newEmail === user.email) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "New email is the same as the current email",
      );
    }

    user.email = newEmail;
    await user.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Email updated successfully",
    });
  });

  static updateMeName = asyncHandler(async (req, res) => {
    const { user_id } = req.user;
    const { newName } = req.body;

    const user = await AuthModel.findById(user_id);

    if (newName === user.name) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "New name is the same as the current name",
      );
    }

    user.name = newName;
    await user.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Name updated successfully",
    });
  });

  static updateMePassword = asyncHandler(async (req, res) => {
    const { user_id } = req.user;
    const { old_password, new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "New password and confirm password do not match",
      );
    }

    if (old_password === new_password) {
      throw new HttpException(
        StatusCodes.BAD_REQUEST,
        "New password must be different from old password",
      );
    }

    const user = await AuthModel.findById(user_id);

    const isMatch = await compare(old_password, user.password);

    if (!isMatch) {
      throw new HttpException(
        StatusCodes.UNAUTHORIZED,
        "Password is incorrect",
      );
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(new_password, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Password updated successfully",
    });
  });
}

module.exports = { AuthController };
