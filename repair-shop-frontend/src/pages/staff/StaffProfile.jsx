import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Form,
  Input,
  Button,
  Divider,
  Avatar,
  Tag,
  Spin,
  message,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  SaveOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { authApi } from "../../api/authApi";
import { formatDate } from "../../utils/helpers";

export default function StaffProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authApi.me();
      setProfile(res.data?.data || null);
    } catch {
      message.error("Loi khi tai thong tin ca nhan");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setChangingPassword(true);
    try {
      await authApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("Doi mat khau thanh cong!");
      passwordForm.resetFields();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Loi khi doi mat khau. Kiem tra lai mat khau hien tai."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <p style={{ color: "#f87171" }}>Khong the tai thong tin ca nhan</p>
        <Button onClick={fetchProfile}>Thu lai</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: "white" }}>Thong tin ca nhan</h2>
        <p style={{ margin: "4px 0 0 0", color: "#9ca3af" }}>
          Xem va quan ly thong tin tai khoan nhan vien
        </p>
      </div>

      <Card className="glass-card" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 24,
          }}
        >
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              flexShrink: 0,
              fontSize: 32,
            }}
          />
          <div>
            <h3 style={{ margin: 0, color: "white", fontSize: 22 }}>
              {profile.fullName}
            </h3>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 6,
                flexWrap: "wrap",
              }}
            >
              <Tag color="purple" style={{ fontSize: 13 }}>
                {profile.role === "STAFF" ? "Nhan vien ky thuat" : profile.role}
              </Tag>
              <Tag
                color={profile.status === "ACTIVE" ? "green" : "red"}
                style={{ fontSize: 13 }}
              >
                {profile.status === "ACTIVE" ? "Dang hoat dong" : "Da khoa"}
              </Tag>
            </div>
          </div>
        </div>

        <Divider style={{ borderColor: "#2d2b52", margin: "0 0 20px 0" }} />

        <Descriptions column={{ xs: 1, sm: 2 }} size="middle">
          <Descriptions.Item
            label={
              <span style={{ color: "#9ca3af" }}>
                <IdcardOutlined style={{ marginRight: 6 }} />
                Ten dang nhap
              </span>
            }
          >
            <span
              style={{
                fontFamily: "monospace",
                color: "#a78bfa",
                fontWeight: 600,
              }}
            >
              {profile.username}
            </span>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span style={{ color: "#9ca3af" }}>
                <MailOutlined style={{ marginRight: 6 }} />
                Dia chi email
              </span>
            }
          >
            <span style={{ color: "#e2e8f0" }}>{profile.email || "---"}</span>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span style={{ color: "#9ca3af" }}>
                <PhoneOutlined style={{ marginRight: 6 }} />
                So dien thoai
              </span>
            }
          >
            <span style={{ color: "#e2e8f0" }}>{profile.phone || "---"}</span>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span style={{ color: "#9ca3af" }}>Ngay tham gia</span>
            }
          >
            <span style={{ color: "#e2e8f0" }}>
              {formatDate(profile.createdAt)}
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LockOutlined style={{ color: "#a78bfa" }} />
            <span style={{ color: "white" }}>Doi mat khau</span>
          </div>
        }
        className="glass-card"
      >
        <p style={{ color: "#9ca3af", marginBottom: 20, fontSize: 14 }}>
          Mat khau moi phai co it nhat 8 ky tu.
        </p>

        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          style={{ maxWidth: 480 }}
        >
          <Form.Item
            name="oldPassword"
            label={
              <span style={{ color: "#e2e8f0" }}>Mat khau hien tai</span>
            }
            rules={[
              { required: true, message: "Vui long nhap mat khau hien tai" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#6b7280" }} />}
              placeholder="Nhap mat khau dang dung..."
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={<span style={{ color: "#e2e8f0" }}>Mat khau moi</span>}
            rules={[
              { required: true, message: "Vui long nhap mat khau moi" },
              { min: 8, message: "Mat khau moi phai co it nhat 8 ky tu" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#6b7280" }} />}
              placeholder="Nhap mat khau moi (toi thieu 8 ky tu)..."
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={
              <span style={{ color: "#e2e8f0" }}>Xac nhan mat khau moi</span>
            }
            rules={[
              { required: true, message: "Vui long xac nhan mat khau moi" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mat khau xac nhan khong khop!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#6b7280" }} />}
              placeholder="Nhap lai mat khau moi..."
              size="large"
            />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={changingPassword}
              icon={<SaveOutlined />}
              size="large"
              style={{
                background: "#7c3aed",
                borderColor: "#7c3aed",
                minWidth: 160,
              }}
            >
              Doi mat khau
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
