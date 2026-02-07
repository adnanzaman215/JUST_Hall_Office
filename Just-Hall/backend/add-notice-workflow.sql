-- Add workflow fields to notices_notice and create audit log table
ALTER TABLE notices_notice
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PendingReview',
  ADD COLUMN created_by INT NOT NULL DEFAULT 0,
  ADD COLUMN submitted_at DATETIME NULL,
  ADD COLUMN reviewed_at DATETIME NULL,
  ADD COLUMN reviewed_by INT NULL,
  ADD COLUMN review_remarks VARCHAR(500) NULL,
  ADD COLUMN published_at DATETIME NULL;

CREATE TABLE IF NOT EXISTS notices_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notice_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  performed_by INT NOT NULL,
  performed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes VARCHAR(500) NULL,
  INDEX idx_notice_id (notice_id),
  INDEX idx_performed_at (performed_at)
);
