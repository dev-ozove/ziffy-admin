// components/Filters.jsx
import { Form, Row, Col, Button } from "react-bootstrap";
import { Search, Event } from "@mui/icons-material";

export const Filters = ({ filters, setFilters, resetFilters }) => (
  <div className="mb-4 p-4 border rounded">
    <Row>
      <Col md={3} className="mb-3">
        <Form.Group>
          <Form.Label>
            <Search className="me-2" />
            Search
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Search bookings..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </Form.Group>
      </Col>

      <Col md={3} className="mb-3">
        <Form.Group>
          <Form.Label>
            <Event className="me-2" />
            Status
          </Form.Label>
          <Form.Select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="all">All Statuses</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.text} ({config.code})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={3} className="d-flex gap-2 align-items-end">
        <Button variant="danger" onClick={resetFilters} className="w-100">
          Reset Filters
        </Button>
      </Col>
    </Row>
  </div>
);
