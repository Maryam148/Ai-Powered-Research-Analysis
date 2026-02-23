import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Paper } from '@/lib/types/paper';
import { BookOpen, Users, Calendar, Quote } from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
  onSelect?: (paper: Paper) => void;
}

export function PaperCard({ paper, onSelect }: PaperCardProps) {
  const sourceColors = {
    'semantic-scholar': 'bg-blue-500',
    'openalex': 'bg-green-500',
    'crossref': 'bg-purple-500',
  };

  return (
    <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect?.(paper)}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-lg leading-tight flex-1">
            {paper.title}
          </h3>
          <Badge className={`${sourceColors[paper.source]} text-white shrink-0`}>
            {paper.source}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {paper.authors.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="line-clamp-1">
                {paper.authors.slice(0, 3).map(a => a.name).join(', ')}
                {paper.authors.length > 3 && ` +${paper.authors.length - 3}`}
              </span>
            </div>
          )}

          {paper.year > 0 && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{paper.year}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Quote className="h-4 w-4" />
            <span>{paper.citationCount} citations</span>
          </div>
        </div>

        {paper.abstract && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {paper.abstract}
          </p>
        )}

        {paper.venue && (
          <div className="flex items-center gap-1 text-sm">
            <BookOpen className="h-4 w-4" />
            <span className="text-muted-foreground">{paper.venue}</span>
          </div>
        )}

        {paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {paper.fieldsOfStudy.slice(0, 3).map((field, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {field}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
